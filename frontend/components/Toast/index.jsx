'use client';

import React from 'react';
import './style.scss';

export default class Toast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      success: false,
      message: null,
      timeout: null,
    };

    this.showToast = this.showToast.bind(this);
    this.hideToast = this.hideToast.bind(this);
  }

  componentDidMount() {
    if (this.props.showing) {
      this.showToast(this.props.message, this.props.success, this.props.duration, this.props.tone);
    }
  }

  // `tone` overrides the green/red picked from `success`. `"concealed"` confirms that something was
  // hidden from view (e.g. decisions withheld from applicants) without reading as a failure.
  showToast(message, success, duration = 3000, tone) {
    this.setState((prev) => {
      if (prev.timeout) clearTimeout(prev.timeout);
      return {
        showing: true,
        success,
        tone,
        message: message ? message.toString() : success ? 'Success' : 'Error',
        timeout: setTimeout(this.hideToast, duration),
      };
    });
  }

  hideToast() {
    this.setState(prev => Object.assign({}, prev, { showing: false }));
  }

  componentDidUpdate(prevProps) {
    // Only re-trigger on an actual prop change from the parent, not on
    // updates caused by this component's own setState (e.g. hideToast) —
    // otherwise, since `this.props.showing` would still be true, hideToast
    // would immediately re-arm showToast and the toast would never close.
    const propsChanged = prevProps.showing !== this.props.showing
      || prevProps.message !== this.props.message
      || prevProps.success !== this.props.success
      || prevProps.tone !== this.props.tone;

    if (this.props.showing && propsChanged) {
      this.showToast(this.props.message, this.props.success, this.props.duration, this.props.tone);
    }
  }

  render() {
    const tone = this.state.tone ?? (this.state.success ? 'success' : 'error');
    return (
      <div
        className={`toast ${tone}${
          this.state.showing ? ' showing' : ''
        }`}
      >
        <p>{this.state.message}</p>
      </div>
    );
  }
}
