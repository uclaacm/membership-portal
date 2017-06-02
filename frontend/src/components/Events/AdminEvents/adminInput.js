import React from 'react'

export default class AdminInput extends React.Component {
    render() {
        const className = "admin-input " + (this.props.field);
        return (
            <div className={className}>
                <span className="BodySecondary">{this.props.text}</span>
                <br/>
                <input type="text" className="TitleSecondary" defaultValue={this.props.placeholder}/>
            </div>
        );
    }
}