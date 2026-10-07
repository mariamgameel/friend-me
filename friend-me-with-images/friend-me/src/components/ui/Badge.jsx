import React from "react";

export default function Badge({
  children,
  variant = "pink", // pink | yellow | green | red | dark | neutral
  className = "",
  style = {}
}) {
  const badgeClass = `badge badge-${variant} ${className}`;
  return (
    <span className={badgeClass} style={style}>
      {children}
    </span>
  );
}
