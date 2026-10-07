import React from "react";

export default function Skeleton({
  variant = "text", // text | card | table-row | avatar | rect
  width,
  height,
  className = "",
  style = {}
}) {
  const baseStyle = {
    background: "linear-gradient(90deg, #ECE8E1 25%, #F7F5F0 50%, #ECE8E1 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "var(--radius-sm)",
    display: "inline-block",
    ...style
  };

  if (variant === "text") {
    return (
      <div
        className={`skeleton skeleton-text ${className}`}
        style={{ width: width || "100%", height: height || "16px", marginBottom: "8px", ...baseStyle }}
      />
    );
  }

  if (variant === "avatar") {
    return (
      <div
        className={`skeleton skeleton-avatar ${className}`}
        style={{
          width: width || "44px",
          height: height || "44px",
          borderRadius: "50%",
          ...baseStyle
        }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`skeleton skeleton-card card ${className}`}
        style={{
          width: width || "100%",
          height: height || "320px",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          ...baseStyle
        }}
      />
    );
  }

  if (variant === "table-row") {
    return (
      <tr className={`skeleton-row ${className}`}>
        <td colSpan={10} style={{ padding: "16px 20px" }}>
          <div style={{ height: "20px", width: "100%", ...baseStyle }} />
        </td>
      </tr>
    );
  }

  return (
    <div
      className={`skeleton skeleton-rect ${className}`}
      style={{ width: width || "100%", height: height || "100px", ...baseStyle }}
    />
  );
}
