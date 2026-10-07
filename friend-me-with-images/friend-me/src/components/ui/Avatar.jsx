import React from "react";

export function Avatar({
  name = "User",
  src = null,
  size = 40,
  className = ""
}) {
  const initial = (name || "U").charAt(0).toUpperCase();

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "var(--primary-light)",
        color: "var(--primary)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: `${Math.round(size * 0.42)}px`,
        overflow: "hidden",
        border: "1.5px solid rgba(165, 105, 88, 0.2)",
        flexShrink: 0
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

export function Spinner({ size = 32, className = "" }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        margin: "24px auto"
      }}
    />
  );
}

export default Avatar;
