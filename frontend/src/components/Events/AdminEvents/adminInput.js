import React from 'react'

export default class AdminInput extends React.Component {
    render() {
        const className = "admin-input " + (this.props.field);
        return (
            <div className={className}>
                <span>{this.props.text}</span>
                <br/>
                <input type="text" className="BodySecondary" />
            </div>
        );
    }
}