import React from 'react';

export default class Logo extends React.Component {
  render() {
    return (
      <div className="logo">
        <img className="login-logo" src={this.props.pic} />
      </div>
    );
  }
}
