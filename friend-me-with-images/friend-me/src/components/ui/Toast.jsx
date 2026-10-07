import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div
        className="toast-container"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: "var(--z-toast)",
          maxWidth: "380px",
          width: "calc(100vw - 48px)",
          pointerEvents: "none"
        }}
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const config = {
            success: {
              bg: "var(--white)",
              border: "1.5px solid var(--green)",
              color: "var(--green)",
              icon: <CheckCircle2 size={18} color="var(--green)" />
            },
            error: {
              bg: "var(--white)",
              border: "1.5px solid var(--red)",
              color: "var(--red)",
              icon: <AlertCircle size={18} color="var(--red)" />
            },
            info: {
              bg: "var(--white)",
              border: "1.5px solid var(--border)",
              color: "var(--primary)",
              icon: <Info size={18} color="var(--primary)" />
            }
          }[toast.type] || {
            bg: "var(--white)",
            border: "1.5px solid var(--border)",
            color: "var(--black)",
            icon: <Info size={18} />
          };

          return (
            <div
              key={toast.id}
              className="toast-item fade-up"
              style={{
                pointerEvents: "auto",
                background: config.bg,
                border: config.border,
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <div>{config.icon}</div>
              <div style={{ flex: 1, fontSize: "var(--font-sm)", color: "var(--black)", wordBreak: "break-word" }}>
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gray)",
                  padding: "2px"
                }}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
