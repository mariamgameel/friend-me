import React from "react";
import Button from "../ui/Button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="page-container"
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <div className="card" style={{ padding: "48px 32px", maxWidth: "520px" }}>
            <h2 style={{ fontSize: "var(--font-3xl)", marginBottom: "12px", color: "var(--primary)" }}>
              Something went wrong
            </h2>
            <p style={{ color: "var(--gray)", fontSize: "var(--font-base)", marginBottom: "28px", lineHeight: 1.6 }}>
              We encountered an unexpected error while loading this page. Please try refreshing or returning home.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Button variant="primary" onClick={this.handleReload}>
                Refresh Page
              </Button>
              <a href="/">
                <Button variant="outline">Go to Homepage</Button>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
