"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-fallback border border-[var(--pipboy-alert-red)] bg-[var(--pipboy-dark)] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">⚠</span>
            <h2 className="glow-text-red font-[family-name:var(--font-pipboy)] text-lg">
              SYSTEM MALFUNCTION
            </h2>
          </div>

          <p className="glow-text mb-3 font-[family-name:var(--font-pipboy)] text-sm opacity-70">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>

          <button
            onClick={this.handleRetry}
            className="border border-[var(--pipboy-green)] px-4 py-2 font-[family-name:var(--font-pipboy)] text-sm text-[var(--pipboy-green)] transition-colors hover:bg-[var(--pipboy-green)] hover:text-[var(--pipboy-dark)]"
          >
            RETRY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
