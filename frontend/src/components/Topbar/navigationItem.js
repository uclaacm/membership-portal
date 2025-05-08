import React from 'react';

export default class NavigationItem extends React.Component {
  render() {
    return (
      <div className="navigation-item">
        <span>{this.props.text}</span>
      </div>
    );
  }
}
