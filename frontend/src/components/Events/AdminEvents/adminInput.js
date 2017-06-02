import React from 'react'
import InputElement from 'react-input-mask';

export default class AdminInput extends React.Component {
    render() {
        const className = "admin-input " + (this.props.field);
        return (
            <div className={className}>
                <span className="BodySecondary">{this.props.text}</span>
                <br/>
                <InputElement className="TitleSecondary" placeholder={this.props.placeholder} mask={this.props.mask} defaultValue={this.props.val}/>
                
            </div>
        );
    }
}