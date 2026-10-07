import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import Button from "./ui/Button";
import "./CartDrawer.css";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    itemCount
  } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="cart-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeCart(); }}>
      <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping Cart">
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} color="var(--primary)" />
            <h3>Your Cart</h3>
            <span className="cart-count-pill">{itemCount}</span>
          </div>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag size={48} strokeWidth={1.5} color="var(--primary)" />
            </div>
            <h4>Your cart is empty</h4>
            <p>Looks like you haven't added any pet supplies yet.</p>
            <Button
              variant="primary"
              onClick={() => {
                closeCart();
                navigate("/shop");
              }}
            >
              Explore Shop
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.product} className="cart-item">
                  <div className="cart-item-img">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>🦴</span>
                    )}
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h4>{item.name}</h4>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.product)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="cart-item-price">${item.price.toFixed(2)}</div>
                    <div className="cart-stepper">
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 99)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-subtotal-row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <p className="cart-shipping-note">
                {subtotal >= 100
                  ? "✓ Free shipping unlocked!"
                  : `Add $${(100 - subtotal).toFixed(2)} more for free delivery`}
              </p>
              <Button
                variant="primary"
                size="lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  closeCart();
                  navigate("/checkout");
                }}
              >
                <span>Checkout</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
