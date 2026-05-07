import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  failed: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(_error, _info);
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="error-state">
          <h1>Reaction Diffusion Patternmaker</h1>
          <p>
            The renderer hit a browser error. Refreshing the page usually
            restores the workspace.
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}
