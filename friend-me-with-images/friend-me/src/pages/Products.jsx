import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/ui/Toast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useDebounce } from "../hooks/useDebounce";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Eye,
  X,
  Sparkles,
  Check
} from "lucide-react";
import "./Products.css";

const CATEGORIES = [
  "All",
  "Food",
  "Toys",
  "Beds",
  "Walking",
  "Grooming",
  "Travel",
  "Other"
];

export default function Products() {
  useDocumentTitle("Pet Supplies Shop");

  const [searchParams, setSearchParams] = useSearchParams();
  const { items, addToCart, updateQuantity, openCart } = useCart();
  const { showToast } = useToast();

  const initialSearch = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const category = searchParams.get("category") || "All";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);

  // Quick-view modal state
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("q") || "")) {
      updateParam("q", debouncedSearch, true);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    const params = {
      page,
      limit: 12,
      sort
    };
    if (debouncedSearch) params.q = debouncedSearch;
    if (category && category !== "All") params.category = category;
    if (inStock) params.inStock = "true";

    getProducts(params)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setProducts(list);
        if (res.meta || res.data?.meta) {
          setMeta(res.meta || res.data.meta);
        } else {
          setMeta({ total: list.length, page, pages: 1, limit: 12 });
        }
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateParam = (key, value, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (resetPage) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const getItemCartQty = (productId) => {
    const found = items.find((i) => i.product === productId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
    showToast(`Added ${product.name} to your cart! 🛍️`, "success");
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewQty(1);
  };

  return (
    <div className="page-container shop-page">
      {/* Header */}
      <div className="shop-header fade-up">
        <div className="shop-header-title">
          <h1>Rescue Pet Shop</h1>
          <p>
            100% of proceeds fund food, veterinary care, and shelter for dogs awaiting adoption.
          </p>
        </div>

        <button className="cart-quick-btn" onClick={openCart}>
          <ShoppingBag size={18} />
          <span>View Cart</span>
          {items.length > 0 && <span className="cart-badge-pill">{items.length}</span>}
        </button>
      </div>

      {/* Category Chips Bar */}
      <div className="category-chips-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-chip-btn ${category === cat ? "active" : ""}`}
            onClick={() => updateParam("category", cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search and Filters Row */}
      <div className="shop-toolbar-row">
        <div className="shop-search-wrap">
          <Search size={18} className="shop-search-icon" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="clear-search-btn" onClick={() => setSearchInput("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="shop-filters-controls">
          <label className="in-stock-toggle">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => updateParam("inStock", e.target.checked ? "true" : "")}
            />
            <span>In Stock Only</span>
          </label>

          <div className="shop-sort-wrap">
            <label htmlFor="shop-sort">Sort:</label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value, false)}
            >
              <option value="newest">Featured & Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="nameAsc">Product Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="We couldn't find any items matching your selected criteria. Try resetting filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchInput("");
            setSearchParams(new URLSearchParams());
          }}
        />
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => {
              const inCartQty = getItemCartQty(product._id);
              const outOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;

              return (
                <div key={product._id} className="product-card card">
                  <div className="product-img-box">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : null}
                    <span className="product-placeholder" style={{ display: product.image ? "none" : "block" }}>
                      🦴
                    </span>

                    <span className="category-pill">{product.category || "Pet Supply"}</span>

                    {/* Quick view button on hover */}
                    <button
                      className="quick-view-btn"
                      onClick={() => openQuickView(product)}
                      aria-label={`Quick view ${product.name}`}
                      title="Quick View"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  <div className="product-card-body">
                    <div className="product-top-row">
                      <h3 className="product-title">{product.name}</h3>
                      <strong className="product-price">${Number(product.price).toFixed(2)}</strong>
                    </div>

                    <p className="product-desc">
                      {product.description?.slice(0, 75)}...
                    </p>

                    <div className="product-stock-row">
                      {outOfStock ? (
                        <Badge variant="red">Out of stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="yellow">Only {product.stock} left!</Badge>
                      ) : (
                        <Badge variant="green">{product.stock} in stock</Badge>
                      )}
                    </div>

                    <div className="product-card-actions">
                      {inCartQty > 0 ? (
                        <div className="in-cart-stepper">
                          <button
                            onClick={() => updateQuantity(product._id, inCartQty - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="stepper-val">{inCartQty} in cart</span>
                          <button
                            onClick={() => updateQuantity(product._id, inCartQty + 1)}
                            disabled={inCartQty >= product.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={outOfStock}
                          onClick={() => handleAddToCart(product, 1)}
                          icon={<ShoppingBag size={14} />}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          {outOfStock ? "Unavailable" : "Add to Cart"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={meta.page || 1}
            pages={meta.pages || 1}
            onPageChange={(newPage) => updateParam("page", String(newPage), false)}
          />
        </>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <Modal
          isOpen={true}
          onClose={() => setQuickViewProduct(null)}
          title="Product Quick View"
          maxWidth="640px"
        >
          <div className="quickview-layout">
            <div className="quickview-img-box card">
              {quickViewProduct.image ? (
                <img src={quickViewProduct.image} alt={quickViewProduct.name} />
              ) : (
                <span style={{ fontSize: "64px" }}>🦴</span>
              )}
            </div>
            <div className="quickview-details">
              <Badge variant="pink">{quickViewProduct.category || "Pet Supply"}</Badge>
              <h2>{quickViewProduct.name}</h2>
              <div className="quickview-price">${Number(quickViewProduct.price).toFixed(2)}</div>
              <p className="quickview-desc">{quickViewProduct.description}</p>

              <div className="quickview-stock">
                {quickViewProduct.stock <= 0 ? (
                  <Badge variant="red">Out of stock</Badge>
                ) : quickViewProduct.stock <= 5 ? (
                  <Badge variant="yellow">Only {quickViewProduct.stock} left in stock</Badge>
                ) : (
                  <Badge variant="green">In Stock ({quickViewProduct.stock})</Badge>
                )}
              </div>

              {quickViewProduct.stock > 0 && (
                <div className="quickview-qty-row">
                  <div className="cart-stepper">
                    <button
                      onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                      disabled={quickViewQty <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{quickViewQty}</span>
                    <button
                      onClick={() => setQuickViewQty(Math.min(quickViewProduct.stock, quickViewQty + 1))}
                      disabled={quickViewQty >= quickViewProduct.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      handleAddToCart(quickViewProduct, quickViewQty);
                      setQuickViewProduct(null);
                    }}
                    icon={<ShoppingBag size={16} />}
                  >
                    Add {quickViewQty} to Cart · ${(Number(quickViewProduct.price) * quickViewQty).toFixed(2)}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
