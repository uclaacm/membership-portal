import React, { PropTypes } from 'react'

export default class NavigationItem extends React.Component {
    render () {
        return(
            <div className="navigation-item">
                <i className={"icon fa " + this.props.icon}></i>
                <span>{this.props.text}</span>
            </div>
        );
    }
}
