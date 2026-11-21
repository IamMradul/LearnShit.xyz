import React from 'react';

interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface State {
  failed: boolean;
}

export class RendererErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.children !== this.props.children && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
