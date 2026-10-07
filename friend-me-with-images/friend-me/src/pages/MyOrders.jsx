import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/orders";
import { useToast } from "../components/ui/Toast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/error";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import {
  Package,
  Calendar,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Ban
} from "lucide-react";
import "./MyOrders.css";

export default function MyOrders() {
  useDocumentTitle("My Orders");

  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyOrders()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setOrders(list);
      })
      .catch((err) => {
        showToast(getErrorMessage(err, "Failed to load order history."), "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return <Badge variant="green">Delivered ✓</Badge>;
      case "Shipped":
        return <Badge variant="pink">Shipped 🚚</Badge>;
      case "Cancelled":
        return <Badge variant="red">Cancelled</Badge>;
      default:
        return <Badge variant="yellow">Pending Fulfillment</Badge>;
    }
  };

  return (
    <div className="page-container my-orders-page fade-up">
      <div className="my-orders-header">
        <h1>Order History</h1>
        <p>Review and track your pet supply purchases supporting friend.me rescue operations.</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="200px" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package size={44} color="var(--primary)" />}
          title="No Orders Yet"
          description="You haven't placed any orders in our pet shop. Discover wholesome food, comfortable beds, and interactive toys for your furry companion!"
          actionLabel="Visit Pet Shop"
          onAction={() => (window.location.href = "/shop")}
        />
      ) : (
        <div className="orders-cards-list">
          {orders.map((order) => (
            <div key={order._id} className="order-history-card card">
              <div className="order-card-top">
                <div className="order-id-group">
                  <span className="order-tag">Order #{order._id.slice(-8)}</span>
                  <span className="order-date-text">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>{getOrderStatusBadge(order.status)}</div>
              </div>

              <div className="order-card-middle">
                {/* Items */}
                <div className="order-items-col">
                  <h4>Items Ordered ({order.items?.length})</h4>
                  <div className="order-items-mini-list">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-mini-item">
                        <div className="mini-item-img">
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <span>🦴</span>
                          )}
                        </div>
                        <div className="mini-item-info">
                          <strong>{item.name}</strong>
                          <span>Qty: {item.quantity} · ${Number(item.price).toFixed(2)} each</span>
                        </div>
                        <div className="mini-item-total">
                          ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment summary */}
                <div className="order-details-col">
                  <div className="order-info-block">
                    <span className="info-block-label">
                      <MapPin size={14} /> Shipping Destination:
                    </span>
                    <p>
                      <strong>{order.shippingAddress?.fullName}</strong><br />
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
                      Phone: {order.shippingAddress?.phone}
                    </p>
                  </div>

                  <div className="order-info-block">
                    <span className="info-block-label">Payment Method:</span>
                    <p>Cash on Delivery (COD)</p>
                  </div>

                  <div className="order-pricing-summary">
                    <div className="pricing-row">
                      <span>Subtotal:</span>
                      <span>${order.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="pricing-row">
                      <span>Shipping Fee:</span>
                      <span>{order.shippingFee === 0 ? "FREE" : `$${order.shippingFee?.toFixed(2)}`}</span>
                    </div>
                    <div className="pricing-row total-row">
                      <strong>Total:</strong>
                      <strong>${order.total?.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
