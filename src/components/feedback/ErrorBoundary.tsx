import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Licitor render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="neo-card mx-auto max-w-lg space-y-4 p-6 text-center" role="alert">
          <h2 className="text-2xl font-black">Something went wrong</h2>
          <p className="text-sm text-[var(--ink-muted)]">{this.state.error.message}</p>
          <Button type="button" onClick={() => window.location.reload()}>
            Reload app
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
