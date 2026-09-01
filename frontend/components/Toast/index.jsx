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
      this.showToast(this.props.message, this.props.success, this.props.duration);
    }
  }

  showToast(message, success, duration = 3000) {
    this.setState((prev) => {
      if (prev.timeout) clearTimeout(prev.timeout);
      return {
        showing: true,
        success,
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
      || prevProps.success !== this.props.success;

    if (this.props.showing && propsChanged) {
      this.showToast(this.props.message, this.props.success, this.props.duration);
    }
  }

  render() {
    return (
      <div
        className={`toast${this.state.success ? ' success' : ' error'}${
          this.state.showing ? ' showing' : ''
        }`}
      >
        <p>{this.state.message}</p>
      </div>
    );
  }
}
