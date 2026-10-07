import React from "react";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = ""
}) {
  return (
    <div
      className={`tabs-container ${className}`}
      role="tablist"
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "4px",
        marginBottom: "24px"
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              border: isActive ? "none" : "1px solid var(--border)",
              background: isActive ? "var(--primary)" : "var(--white)",
              color: isActive ? "var(--white)" : "var(--black)",
              fontWeight: 600,
              fontSize: "var(--font-sm)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all var(--transition-fast)"
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  background: isActive ? "rgba(255, 255, 255, 0.25)" : "var(--surface-alt)",
                  color: isActive ? "var(--white)" : "var(--gray)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-xs)",
                  marginLeft: "4px"
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
