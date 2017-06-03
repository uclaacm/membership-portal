import React from 'react'
import InputElement from 'react-input-mask';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';

export default class AdminInput extends React.Component {
    render() {
        const className = "admin-input " + (this.props.field);
        return (
            <div className={className}>
                <span className="BodySecondary">{this.props.text}</span>
                <br />
                {!this.props.isDatePicker && <InputElement className="TitleSecondary" placeholder={this.props.placeholder} mask={this.props.mask} defaultValue={this.props.val} />}

                {this.props.isDatePicker && <DatePicker
                    selected={this.props.val}
                    onChange={this.handleChange}
                    className="admin-date-picker TitleSecondary"
                />}

            </div>
        );
    }
}