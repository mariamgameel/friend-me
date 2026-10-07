import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page Not Found");

  return (
    <div
      className="page-container"
      style={{
        minHeight: "65vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      <div className="card fade-up" style={{ padding: "56px 36px", maxWidth: "540px", background: "var(--white)" }}>
        <span style={{ fontSize: "64px", display: "block", marginBottom: "16px" }}>🐾</span>
        <h1 style={{ fontSize: "var(--font-4xl)", marginBottom: "12px", color: "var(--black)" }}>
          404
        </h1>
        <h2 style={{ fontSize: "var(--font-2xl)", marginBottom: "16px", color: "var(--primary)" }}>
          Lost Your Way?
        </h2>
        <p style={{ color: "var(--gray)", fontSize: "var(--font-base)", marginBottom: "32px", lineHeight: 1.6 }}>
          The page you are looking for might have been moved, renamed, or doesn't exist. Don't worry, our furry friends can guide you back!
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link to="/">
            <Button variant="primary">Return Home</Button>
          </Link>
          <Link to="/adopt">
            <Button variant="outline">Browse Dogs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
