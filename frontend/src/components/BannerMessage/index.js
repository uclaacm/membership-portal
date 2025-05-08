import React from 'react';

export default class BannerMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      success: false,
      message: null,
      timeout: null,
    };

    this.showBanner = this.showBanner.bind(this);
    this.hideBanner = this.hideBanner.bind(this);

    if (props.showing) {
      this.showBanner(props.message, props.success, props.duration);
    }
  }

  showBanner(message, success, duration = 3000) {
    this.setState((prev) => {
      if (prev.timeout) clearTimeout(prev.timeout);
      return {
        showing: true,
        success,
        message: message ? message.toString() : success ? 'Success' : 'Error',
        timeout: setTimeout(this.hideBanner, duration),
      };
    });
  }

  hideBanner() {
    this.setState(prev => Object.assign({}, prev, { showing: false }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showing) {
      this.showBanner(nextProps.message, nextProps.success, nextProps.duration);
    }
  }

  render() {
    return (
      <div
        className={`banner-message ${this.state.success ? ' success' : ' error'}${
          this.state.showing ? ' showing' : ''
        }`}
      >
        <p>{this.state.message}</p>
      </div>
    );
  }
}
