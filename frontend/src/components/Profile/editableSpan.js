import React from 'react';
import ReactDOM from 'react-dom';

export default class EditableSpan extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: props.value };
        this.emitChange = this.emitChange.bind(this);
    }

    emitChange() {
        let html = ReactDOM.findDOMNode(this).innerHTML;
        this.props.onChange({ 
            target: this.props.target,
            value: html
        });
    }

    shouldComponentUpdate(nextState) {
        return nextState.value !== ReactDOM.findDOMNode(this).innerHTML;
    }

    render() {
        return <span contentEditable="true" className="Display-2Primary editable" onInput={ this.emitChange } onBlur={ this.emitChange}>{this.state.value}</span>;
    }
}