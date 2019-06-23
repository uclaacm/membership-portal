import React from 'react';

export default class NavigationTile extends React.Component {
  render() {
    return (
      <div className="navigation-tile">
        <i className={`icon fa ${this.props.icon}`} />
        <p className="Body-2White">{this.props.text}</p>
      </div>
    );
  }
}
