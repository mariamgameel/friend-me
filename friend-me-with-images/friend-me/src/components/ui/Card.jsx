import React from "react";

export default function Card({
  children,
  className = "",
  interactive = true,
  style = {},
  ...props
}) {
  return (
    <div
      className={`card ${interactive ? "" : "card-static"} ${className}`}
      style={{
        padding: "24px",
        ...(!interactive ? { transform: "none", boxShadow: "var(--shadow-sm)" } : {}),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
