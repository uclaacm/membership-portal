import React from 'react';

export default class Username extends React.Component {
  render() {
    return <div><h3 className="side-tag username Display-2White">{this.props.username}</h3></div>;
  }
}
