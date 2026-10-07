import React from "react";

export default function FormField({
  id,
  label,
  required = false,
  error = null,
  hint = null,
  children,
  className = ""
}) {
  return (
    <div className={`form-field ${className}`} style={{ marginBottom: "18px" }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontSize: "var(--font-sm)",
            fontWeight: 600,
            color: "var(--black)",
            marginBottom: "6px"
          }}
        >
          {label}
          {required && <span style={{ color: "var(--primary)", marginLeft: "4px" }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p style={{ fontSize: "var(--font-xs)", color: "var(--gray)", marginTop: "4px" }}>
          {hint}
        </p>
      )}
      {error && (
        <p
          role="alert"
          style={{
            fontSize: "var(--font-xs)",
            color: "var(--red)",
            marginTop: "4px",
            fontWeight: 500
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
