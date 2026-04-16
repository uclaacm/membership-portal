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

    if (props.showing) {
      this.showToast(props.message, props.success, props.duration);
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.showing) {
      this.showToast(nextProps.message, nextProps.success, nextProps.duration);
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
