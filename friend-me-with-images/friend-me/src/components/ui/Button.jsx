import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary", // primary | dark | outline | ghost
  size = "md", // sm | md | lg
  loading = false,
  disabled = false,
  icon = null,
  type = "button",
  className = "",
  onClick,
  ...props
}) {
  const variantClass = {
    primary: "btn-primary",
    dark: "btn-dark",
    outline: "btn-outline",
    ghost: "btn-ghost"
  }[variant] || "btn-primary";

  const sizeStyles = {
    sm: { padding: "8px 16px", fontSize: "13px" },
    md: {},
    lg: { padding: "14px 34px", fontSize: "16px" }
  }[size] || {};

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${variantClass} ${className}`}
      style={sizeStyles}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="btn-spinner" size={16} style={{ animation: "spin 0.8s linear infinite" }} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
