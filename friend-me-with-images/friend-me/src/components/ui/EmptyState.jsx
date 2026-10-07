import React from "react";
import Button from "./Button";
import { SearchX } from "lucide-react";

export default function EmptyState({
  icon = <SearchX size={44} color="var(--primary)" />,
  title = "No results found",
  description = "Try adjusting your filters or search terms to find what you're looking for.",
  actionLabel = null,
  onAction = null,
  className = ""
}) {
  return (
    <div
      className={`empty-state card ${className}`}
      style={{
        textAlign: "center",
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        margin: "32px 0",
        background: "var(--white)"
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "var(--primary-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "8px"
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "var(--font-xl)", margin: 0 }}>{title}</h3>
      <p style={{ color: "var(--gray)", maxWidth: "420px", fontSize: "var(--font-sm)", margin: 0, lineHeight: 1.6 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <div style={{ marginTop: "12px" }}>
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
