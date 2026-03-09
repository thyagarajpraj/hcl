import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Here you could also log the error to an error reporting service
    // like Sentry, LogRocket, etc.
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="page-shell">
          <section className="panel mt-12">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-slate-600 mb-6 max-w-xl">
                We encountered an unexpected error. Our team has been notified and we're working on fixing it.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-2xl">
                  <p className="text-sm font-mono text-red-700">{this.state.error.toString()}</p>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.resetError}
                  className="submit-button"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = "/"}
                  className="inline-button"
                >
                  Go Home
                </button>
              </div>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
