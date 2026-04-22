import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gdpro-bg p-6">
          <div className="max-w-lg w-full gdpro-card p-6">
            <div className="text-4xl mb-4">💥</div>
            <h2 className="text-lg font-semibold text-gdpro-danger mb-2">应用渲染出错</h2>
            <p className="text-sm text-gdpro-text-secondary mb-4">
              这是一个意外的错误。请尝试刷新页面（Ctrl+F5 强制刷新）。
              如果问题持续，请检查控制台错误信息。
            </p>
            <div className="bg-gdpro-bg-surface rounded-md p-3 overflow-x-auto">
              <pre className="text-xs text-gdpro-text-muted font-mono whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="gdpro-button mt-4 w-full"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
