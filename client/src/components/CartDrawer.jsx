import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { money, unitLabel } from "../format.js";
import ProductArt from "./ProductArt.jsx";

export default function CartDrawer() {
  const { items, quote, isOpen, closeCart, setQty, remove, promoCode, setPromoCode } = useCart();
  const navigate = useNavigate();
  const [code, setCode] = useState(promoCode);

  useEffect(() => {
    setCode(promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("locked");
    };
  }, [isOpen, closeCart]);

  const toFreeShipping = quote && quote.hasPhysical && quote.shippingCents > 0
    ? quote.freeShippingMinCents - (quote.subtotalCents - quote.memberDiscountCents - quote.promoDiscountCents)
    : 0;

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={closeCart} />
      <aside className={`drawer ${isOpen ? "open" : ""}`} aria-label="Cart" aria-hidden={!isOpen}>
        <div className="drawer-head">
          <h3>Your Cart</h3>
          <button className="icon-btn" onClick={closeCart} aria-label="Close cart">✕</button>
        </div>

        <div className="drawer-body">
          {!items.length ? (
            <div className="empty">
              <p>Your cart is empty.</p>
              <Link to="/shop" className="btn btn-ghost btn-sm" onClick={closeCart}>Browse treatments</Link>
            </div>
          ) : (
            <>
              {toFreeShipping > 0 && (
                <div className="ship-meter">
                  <p>You're <strong>{money(toFreeShipping)}</strong> away from free shipping</p>
                  <i style={{ "--w": `${Math.min(100, 100 - (toFreeShipping / quote.freeShippingMinCents) * 100)}%` }} />
                </div>
              )}
              {items.map((item) => (
                <div className="line-item" key={item.productId}>
                  <ProductArt product={item} className="thumb" />
                  <div>
                    <h4><Link to={item.kind === "membership" ? "/membership" : `/products/${item.slug}`} onClick={closeCart}>{item.name}</Link></h4>
                    <div className="unit">{money(item.priceCents)} {unitLabel(item.unit)}{item.rx ? " · Rx" : ""}</div>
                    {item.kind === "membership" ? (
                      <span className="pill">Membership</span>
                    ) : (
                      <div className="qty">
                        <button onClick={() => setQty(item.productId, item.qty - 1)} aria-label="Decrease quantity">−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => setQty(item.productId, item.qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                    )}
                  </div>
                  <div className="lt">
                    {money(item.priceCents * item.qty)}
                    <button className="remove" onClick={() => remove(item.productId)}>Remove</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <form className="promo" onSubmit={(e) => { e.preventDefault(); setPromoCode(code.trim().toUpperCase()); }}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" aria-label="Promo code" />
              <button className="btn btn-ghost btn-sm">Apply</button>
            </form>
            {quote?.promoError && <p className="form-error small">{quote.promoError}</p>}
            {quote && <Totals quote={quote} />}
            {quote?.requiresReview && <p className="muted small">Your cart includes prescription items. You'll complete a short medical intake at checkout, and a provider reviews it before anything ships.</p>}
            <button className="btn btn-gold btn-block" onClick={() => { closeCart(); navigate("/checkout"); }}>
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function Totals({ quote }) {
  return (
    <dl className="totals">
      <div><dt>Subtotal</dt><dd>{money(quote.subtotalCents)}</dd></div>
      {quote.memberDiscountCents > 0 && (
        <div className="discount"><dt>Member savings ({quote.memberTier})</dt><dd>−{money(quote.memberDiscountCents)}</dd></div>
      )}
      {quote.promo && (
        <div className="discount"><dt>{quote.promo.code}</dt><dd>−{money(quote.promoDiscountCents)}</dd></div>
      )}
      <div><dt>Shipping</dt><dd>{quote.shippingCents ? money(quote.shippingCents) : "Free"}</dd></div>
      <div className="grand"><dt>Total due today</dt><dd>{money(quote.totalCents)}</dd></div>
    </dl>
  );
}
