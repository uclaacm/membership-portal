import React from 'react';
import ReactDOM from 'react-dom';

export default class EditableSpan extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: props.value };
        this.emitChange = this.emitChange.bind(this);
    }

    emitChange(e) {
        this.props.onChange({ 
            target: this.props.target,
            value: e.target.innerHTML
        });
    }

    shouldComponentUpdate(nextState) {
        return nextState.value !== ReactDOM.findDOMNode(this).value;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }

    render() {
        return <span contentEditable="true" className="Display-2Primary editable" onInput={ this.emitChange } onBlur={ this.emitChange} dangerouslySetInnerHTML={{__html: this.state.value}}></span>;
    }
}