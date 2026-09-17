import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="error-page">
        <div>
          <span className="eyebrow">TiFund</span>
          <h1>Something went wrong while loading the app.</h1>
          <p>
            Refresh the page. If the problem continues, check the frontend
            server and browser console.
          </p>
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            Refresh application
          </button>
        </div>
      </main>
    );
  }
}
