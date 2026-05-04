import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(res => setProducts(res.data.data || res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="products-header fade-up">
        <h1>Pet Shop</h1>
        <p>Everything your furry friend needs, all in one place.</p>
      </div>
      {loading ? <div className="spinner" /> : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card card">
              <div className="product-img" style={{ background: "var(--yellow)" }}>
                {product.image
                  ? <img src={product.image} alt={product.name}
                      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
                    />
                  : null}
                <span style={{ display: product.image ? "none" : "block", fontSize: "70px" }}>🦴</span>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-footer">
                  <strong className="product-price">${product.price}</strong>
                  <span className={`badge ${product.stock > 0 ? "badge-green" : "badge-pink"}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <div className="empty-state"><span>🛍️</span><p>No products available yet.</p></div>
      )}
    </div>
  );
}
