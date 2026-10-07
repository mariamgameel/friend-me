import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { CheckCircle2, Package, Home, ArrowRight, Truck } from "lucide-react";
import "./OrderConfirmation.css";

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  useDocumentTitle("Order Confirmed");

  return (
    <div className="page-container confirmation-page fade-up">
      <div className="confirmation-card card">
        <div className="confirm-icon-wrap">
          <CheckCircle2 size={48} color="var(--green)" />
        </div>

        <h1>Thank You for Your Order!</h1>
        <p className="confirm-sub">
          Order <strong>#{id?.slice(-8)}</strong> has been placed and is being prepared for shipment.
        </p>

        <div className="confirm-badge-row">
          <Badge variant="green">Status: Pending Preparation</Badge>
          <Badge variant="neutral">Payment: Cash on Delivery</Badge>
        </div>

        {order && (
          <div className="confirm-order-details">
            <div className="confirm-section-title">
              <Truck size={16} color="var(--primary)" />
              <h4>Delivery Destination</h4>
            </div>
            <p className="confirm-address-text">
              {order.shippingAddress?.fullName}<br />
              {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
              Phone: {order.shippingAddress?.phone}
            </p>

            <div className="confirm-items-summary">
              <h4>Items Ordered ({order.items?.length})</h4>
              {order.items?.map((item, idx) => (
                <div key={idx} className="confirm-item-line">
                  <span>{item.quantity}× {item.name}</span>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
              <div className="confirm-total-line">
                <span>Total Amount:</span>
                <strong>${order.total?.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="confirm-cta-row">
          <Link to="/my-orders">
            <Button variant="primary" icon={<Package size={16} />}>
              View My Orders
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" icon={<ArrowRight size={16} />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
