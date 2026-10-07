import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // danger | primary
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
        <div
          style={{
            background: variant === "danger" ? "var(--red-light)" : "var(--primary-light)",
            color: variant === "danger" ? "var(--red)" : "var(--primary)",
            padding: "10px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <p style={{ color: "var(--gray)", fontSize: "var(--font-sm)", lineHeight: 1.6, margin: 0 }}>
          {message}
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "danger" ? "dark" : "primary"}
          onClick={onConfirm}
          loading={loading}
          style={variant === "danger" ? { background: "var(--red)" } : {}}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
