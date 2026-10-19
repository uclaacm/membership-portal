import React from 'react';

export default class Logo extends React.Component {
  render() {
    return (
      <div className="logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="login-logo" src={this.props.pic} alt="" />
      </div>
    );
  }
}
