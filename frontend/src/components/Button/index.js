import React from 'react'

export default class Button extends React.Component {
    render () {
        return (
            <div className={"button-component " + this.props.className} onClick={ this.props.onClick }>
                <button className={this.props.style}>
                    { (this.props.icon) ? <i className={"fa " + this.props.icon + " button-icon"} aria-hidden="true"></i> : null }
                    <span>{this.props.text}</span>
                </button>
            </div>
        );
    }
}