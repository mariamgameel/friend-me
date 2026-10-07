import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orders";
import { useToast } from "../components/ui/Toast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/error";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import "./Checkout.css";

export default function Checkout() {
  useDocumentTitle("Checkout");

  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.username || "",
    phone: "",
    city: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);

  const shippingFee = subtotal >= 100 || subtotal === 0 ? 0 : 10;
  const total = parseFloat((subtotal + shippingFee).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast("Your cart is empty. Add products before checking out.", "error");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: form
      };

      const res = await createOrder(orderPayload);
      const createdOrder = res.data;

      clearCart();
      showToast("Order placed successfully! 🎉", "success");
      navigate(`/orders/${createdOrder._id}/confirmation`, { state: { order: createdOrder } });
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to place order."), "error");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-container checkout-empty card">
        <ShoppingBag size={56} color="var(--primary)" />
        <h2>Your Cart is Empty</h2>
        <p>You cannot checkout with an empty cart. Browse our store to discover wholesome supplies for your dog.</p>
        <Link to="/shop">
          <Button variant="primary">Return to Pet Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container checkout-page fade-up">
      <Link to="/shop" className="back-link-btn">
        <ArrowLeft size={16} />
        <span>Back to Shop</span>
      </Link>

      <div className="checkout-title-wrap">
        <h1>Complete Your Order</h1>
        <p>Cash on Delivery · Free shipping on orders over $100</p>
      </div>

      <div className="checkout-layout">
        {/* Left: Shipping Form */}
        <div className="checkout-form-panel card">
          <div className="panel-header">
            <Truck size={20} color="var(--primary)" />
            <h3>1. Delivery Address</h3>
          </div>

          <form onSubmit={handleSubmit} id="checkout-form">
            <FormField id="c-name" label="Full Name" required>
              <input
                id="c-name"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </FormField>

            <FormField id="c-phone" label="Phone Number" required hint="Our courier will call this number before arrival">
              <input
                id="c-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </FormField>

            <FormField id="c-city" label="City" required>
              <input
                id="c-city"
                placeholder="New York, Los Angeles..."
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </FormField>

            <FormField id="c-address" label="Street Address & Apt / Unit" required>
              <input
                id="c-address"
                placeholder="123 Main St, Apt 4B"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </FormField>

            <div className="payment-method-box">
              <div className="panel-header" style={{ marginBottom: "10px" }}>
                <DollarSign size={20} color="var(--primary)" />
                <h4>2. Payment Method</h4>
              </div>
              <div className="payment-option selected">
                <div className="payment-dot" />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay in cash upon physical arrival of your package. No card details required.</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary-panel">
          <div className="card summary-card">
            <h3>Order Summary ({items.length} {items.length === 1 ? "item" : "items"})</h3>

            <div className="summary-items-list">
              {items.map((item) => (
                <div key={item.product} className="summary-item-row">
                  <div className="summary-item-img">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>🦴</span>
                    )}
                  </div>
                  <div className="summary-item-info">
                    <strong>{item.name}</strong>
                    <span>Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                  </div>
                  <div className="summary-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="totals-row grand-total">
                <strong>Total Amount</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              variant="primary"
              size="lg"
              loading={loading}
              icon={<CheckCircle2 size={18} />}
              style={{ width: "100%", justifyContent: "center", marginTop: "20px" }}
            >
              Place Order (${total.toFixed(2)})
            </Button>

            <div className="guarantee-box">
              <ShieldCheck size={18} color="var(--primary)" />
              <span>100% of profits support rescued sanctuary dogs.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
