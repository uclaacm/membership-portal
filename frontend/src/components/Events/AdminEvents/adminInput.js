import React from 'react'
import InputElement from 'react-input-mask';
import DatePicker from 'react-datepicker'
import TextareaAutosize from 'react-autosize-textarea';
import 'react-datepicker/dist/react-datepicker.css';

export default class AdminInput extends React.Component {



    render() {



        const className = "admin-input " + (this.props.field);
        return (
            <div className={className}>
                <span className="BodySecondary">{this.props.text}</span>
                <br />
                {!this.props.isDatePicker && !this.props.isDescription && <InputElement className="InputSecondary" placeholder={this.props.placeholder} mask={this.props.mask} defaultValue={this.props.val} />}

                {this.props.isDescription && <TextareaAutosize style={{maxHeight: 144 }} className="InputSecondary description" placeholder={this.props.placeholder} defaultValue={this.props.val}/>}

                {this.props.isDatePicker && <DatePicker
                    selected={this.props.val}
                    onChange={this.props.onChange}
                    className="admin-date-picker InputSecondary"
                />}

            </div>
        );
    }
}