import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const CART_KEY = "ubankis-cart";
const PROMO_KEY = "ubankis-promo";
const CartContext = createContext(null);

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable; cart lives for this tab only.
  }
}

/** Cart items are snapshots for display; the server re-prices everything via /cart/quote. */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(() => load(CART_KEY, []));
  const [promoCode, setPromoCode] = useState(() => load(PROMO_KEY, ""));
  const [isOpen, setOpen] = useState(false);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    save(CART_KEY, items);
  }, [items]);
  useEffect(() => {
    save(PROMO_KEY, promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      return;
    }
    let alive = true;
    const t = setTimeout(() => {
      api("/cart/quote", { method: "POST", body: { items: items.map(({ productId, qty }) => ({ productId, qty })), promoCode } })
        .then((q) => alive && setQuote(q))
        .catch(() => alive && setQuote(null));
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [items, promoCode, user]);

  const add = useCallback((product, qty = 1, { open = true } = {}) => {
    setItems((prev) => {
      const snap = {
        productId: product.id ?? product.productId,
        slug: product.slug,
        name: product.name,
        kind: product.kind || "product",
        priceCents: product.priceCents,
        unit: product.unit,
        rx: !!product.rx,
        form: product.form || (product.kind === "membership" ? "card" : "bottle"),
        tint: product.tint,
        imageUrl: product.imageUrl,
      };
      // Only one membership at a time.
      let next = snap.kind === "membership" ? prev.filter((i) => i.kind !== "membership") : prev;
      const existing = next.find((i) => i.productId === snap.productId);
      if (existing) {
        next = next.map((i) => (i.productId === snap.productId ? { ...i, qty: snap.kind === "membership" ? 1 : Math.min(i.qty + qty, 10) } : i));
      } else {
        next = [...next, { ...snap, qty: snap.kind === "membership" ? 1 : qty }];
      }
      return next;
    });
    toast(`${product.name} added to cart`);
    if (open) setOpen(true);
  }, [toast]);

  const setQty = useCallback((productId, qty) => {
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, qty: Math.min(qty, 10) } : i))));
  }, []);

  const value = useMemo(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    quote,
    promoCode,
    setPromoCode,
    add,
    setQty,
    remove: (productId) => setQty(productId, 0),
    clear: () => {
      setItems([]);
      setPromoCode("");
    },
    isOpen,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
  }), [items, quote, promoCode, add, setQty, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
