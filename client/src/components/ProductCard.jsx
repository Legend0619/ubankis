import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { money, unitLabel } from "../format.js";
import ProductArt from "./ProductArt.jsx";
import Stars from "./Stars.jsx";

export default function ProductCard({ product }) {
  const { add } = useCart();
  return (
    <article className="product">
      <Link to={`/products/${product.slug}`} className="product-img">
        <span className={`tag ${product.rx ? "rx" : ""}`}>{product.rx ? "Rx" : "OTC"}</span>
        {product.bestSeller && <span className="tag best">Best seller</span>}
        <ProductArt product={product} />
      </Link>
      <div className="product-body">
        <span className="cat-name">{product.categoryName}</span>
        <h3><Link to={`/products/${product.slug}`}>{product.name}</Link></h3>
        <p>{product.shortDesc}</p>
        <Stars rating={product.rating} count={product.reviewCount} />
        <div className="price-row">
          <span className="price">{money(product.priceCents)} <small>{unitLabel(product.unit)}</small></span>
          <button className="add-btn" onClick={() => add(product)}>Add</button>
        </div>
      </div>
    </article>
  );
}
