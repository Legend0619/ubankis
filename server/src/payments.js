import { CLIENT_URL, STRIPE_SECRET_KEY } from "./config.js";
import { badRequest, HttpError } from "./utils.js";

let stripeClient = null;
async function stripe() {
  if (!STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    const { default: Stripe } = await import("stripe");
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export const paymentMode = () => (STRIPE_SECRET_KEY ? "stripe" : "demo");

/** Creates a Stripe Checkout session for the order total. Returns null in demo mode. */
export async function createCheckoutSession(order) {
  const client = await stripe();
  if (!client) return null;
  return client.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customer.email,
    client_reference_id: String(order.id),
    metadata: { orderId: String(order.id) },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: order.totalCents,
        product_data: { name: `Ubankis order ${order.number}`, description: order.items.map((i) => `${i.qty}× ${i.name}`).join(", ").slice(0, 500) },
      },
    }],
    success_url: `${CLIENT_URL}/checkout/success/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/checkout?cancelled=${order.id}`,
  });
}

/** Returns the session's payment intent id if the session is paid for this order. */
export async function verifyCheckoutSession(sessionId, orderId) {
  const client = await stripe();
  if (!client) throw badRequest("Stripe is not configured");
  const session = await client.checkout.sessions.retrieve(String(sessionId));
  if (session.metadata?.orderId !== String(orderId)) throw badRequest("Payment does not match this order");
  if (session.payment_status !== "paid") throw new HttpError(402, "Payment has not completed");
  return session.payment_intent || session.id;
}

/** Demo-mode card check. Mirrors Stripe's test cards: 4242… succeeds, 4000 0000 0000 0002 declines. */
export function chargeDemoCard({ number, exp, cvc, name } = {}) {
  const digits = String(number || "").replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits) || !luhn(digits)) throw badRequest("Please enter a valid card number");
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(String(exp || ""));
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) throw badRequest("Expiry must be MM/YY");
  const expEnd = new Date(2000 + Number(m[2]), Number(m[1]), 1);
  if (expEnd <= new Date()) throw badRequest("This card has expired");
  if (!/^\d{3,4}$/.test(String(cvc || ""))) throw badRequest("Please enter a valid CVC");
  if (!String(name || "").trim()) throw badRequest("Name on card is required");
  if (digits === "4000000000000002") throw new HttpError(402, "Your card was declined");
  return `demo_${Date.now().toString(36)}_${digits.slice(-4)}`;
}

function luhn(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}
