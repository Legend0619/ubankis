import { Router } from "express";
import { db, tx } from "../db.js";
import { requireAuth } from "../auth.js";
import { getOrder } from "../mappers.js";
import { quote } from "../pricing.js";
import { chargeDemoCard, createCheckoutSession, paymentMode, verifyCheckoutSession } from "../payments.js";
import { badRequest, HttpError, intParam, str } from "../utils.js";
import { parseAddress } from "./auth.js";

const router = Router();
router.use(requireAuth);

export const ORDER_STATUSES = ["pending_payment", "in_review", "processing", "shipped", "delivered", "cancelled"];
const CANCELLABLE = new Set(["pending_payment", "in_review", "processing"]);

function ownOrder(req) {
  const order = getOrder(intParam(req.params.id));
  if (!order || (order.userId !== req.user.id && req.user.role !== "admin")) throw new HttpError(404, "Order not found");
  return order;
}

function parseIntake(i = {}) {
  const dob = str(i.dob, "Date of birth", { max: 10 });
  const born = new Date(dob);
  if (Number.isNaN(born.getTime())) throw badRequest("Please enter a valid date of birth");
  const age = (Date.now() - born.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (age < 18) throw badRequest("You must be 18 or older for prescription treatment");
  if (age > 120) throw badRequest("Please enter a valid date of birth");
  if (i.consent !== true) throw badRequest("Please confirm the medical consent");
  return {
    dob,
    sex: str(i.sex, "Sex assigned at birth", { max: 20 }),
    heightIn: Number(i.heightIn) || null,
    weightLb: Number(i.weightLb) || null,
    conditions: str(i.conditions, "Medical conditions", { required: false, max: 1000 }) || "None",
    medications: str(i.medications, "Current medications", { required: false, max: 1000 }) || "None",
    allergies: str(i.allergies, "Allergies", { required: false, max: 500 }) || "None",
    consent: true,
  };
}

export function markPaid(orderId, provider, ref) {
  const order = getOrder(orderId);
  if (order.status !== "pending_payment") return order;
  const next = order.requiresReview ? "in_review" : "processing";
  tx(() => {
    db.prepare(`UPDATE orders SET status = ?, payment_provider = ?, payment_ref = ?, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(next, provider, ref, orderId);
    const addEvent = db.prepare("INSERT INTO order_events (order_id, status, note) VALUES (?, ?, ?)");
    addEvent.run(orderId, "paid", "Payment received");
    addEvent.run(orderId, next, next === "in_review" ? "A licensed provider is reviewing your intake" : "Your order is being prepared");
    const membership = order.items.find((i) => i.kind === "membership");
    if (membership) {
      const tier = db.prepare("SELECT plan_key FROM products WHERE id = ?").get(membership.productId)?.plan_key;
      if (tier) db.prepare("UPDATE users SET membership = ? WHERE id = ?").run(tier, order.userId);
    }
  });
  return getOrder(orderId);
}

/** Cancels an order; if it granted the user's current membership, that membership ends. Call inside tx(). */
export function cancelOrder(order, note) {
  db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(order.id);
  db.prepare("INSERT INTO order_events (order_id, status, note) VALUES (?, 'cancelled', ?)").run(order.id, note);
  const membership = order.items.find((i) => i.kind === "membership");
  if (membership && order.paidAt) {
    db.prepare(`UPDATE users SET membership = NULL WHERE id = ? AND membership = (SELECT plan_key FROM products WHERE id = ?)`)
      .run(order.userId, membership.productId);
  }
}

router.get("/", (req, res) => {
  const ids = db.prepare("SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
  res.json({ orders: ids.map((r) => getOrder(r.id)) });
});

router.get("/:id", (req, res) => {
  res.json({ order: ownOrder(req), paymentMode: paymentMode() });
});

router.post("/", async (req, res) => {
  const q = quote(req.body.items, { user: req.user, promoCode: req.body.promoCode });
  if (!q.lines.length) throw badRequest("Your cart is empty");
  if (q.promoError) throw badRequest(q.promoError);
  const address = q.hasPhysical ? parseAddress(req.body.shipping) : null;
  const intake = q.requiresReview ? parseIntake(req.body.intake) : null;

  const orderId = tx(() => {
    const { lastInsertRowid: id } = db.prepare(`INSERT INTO orders
      (user_id, status, subtotal_cents, member_discount_cents, promo_discount_cents, shipping_cents, total_cents, promo_code, shipping_address, requires_review)
      VALUES (?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(req.user.id, q.subtotalCents, q.memberDiscountCents, q.promoDiscountCents, q.shippingCents, q.totalCents,
        q.promo?.code || null, address ? JSON.stringify(address) : null, q.requiresReview ? 1 : 0);

    const addItem = db.prepare(`INSERT INTO order_items (order_id, product_id, slug, name, kind, rx, unit, unit_price_cents, qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const l of q.lines) addItem.run(id, l.productId, l.slug, l.name, l.kind, l.rx ? 1 : 0, l.unit, l.unitPriceCents, l.qty);
    db.prepare("INSERT INTO order_events (order_id, status, note) VALUES (?, 'pending_payment', 'Order created')").run(id);

    if (intake) {
      db.prepare("INSERT INTO consultations (type, user_id, order_id, email, answers) VALUES ('intake', ?, ?, ?, ?)")
        .run(req.user.id, id, req.user.email, JSON.stringify(intake));
    }
    if (address && !req.user.address) {
      db.prepare("UPDATE users SET address = ?, phone = COALESCE(phone, ?) WHERE id = ?").run(JSON.stringify(address), address.phone, req.user.id);
    }
    return Number(id);
  });

  const order = getOrder(orderId);
  const session = await createCheckoutSession(order);
  if (session) {
    db.prepare("UPDATE orders SET payment_provider = 'stripe', payment_ref = ? WHERE id = ?").run(session.id, orderId);
    return res.status(201).json({ order, payment: { mode: "stripe", url: session.url } });
  }
  res.status(201).json({ order, payment: { mode: "demo" } });
});

router.post("/:id/pay", (req, res) => {
  const order = ownOrder(req);
  if (paymentMode() !== "demo") throw badRequest("Card payments are handled by Stripe Checkout");
  if (order.status !== "pending_payment") throw badRequest("This order has already been paid");
  const ref = chargeDemoCard(req.body.card);
  res.json({ order: markPaid(order.id, "demo", ref) });
});

router.post("/:id/confirm", async (req, res) => {
  const order = ownOrder(req);
  if (order.status !== "pending_payment") return res.json({ order });
  const ref = await verifyCheckoutSession(req.body.sessionId, order.id);
  res.json({ order: markPaid(order.id, "stripe", ref) });
});

router.post("/:id/cancel", (req, res) => {
  const order = ownOrder(req);
  if (!CANCELLABLE.has(order.status)) throw badRequest("This order can no longer be cancelled");
  tx(() => cancelOrder(order, order.paidAt ? "Cancelled by customer — refund issued" : "Cancelled by customer"));
  res.json({ order: getOrder(order.id) });
});

export default router;
