import React from 'react';
import {connect} from 'react-redux';
import ConfirmAccountComponent from 'components/ConfirmAccount';

class ConfirmAccount extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ConfirmAccountComponent />
        );
    }
}

export default connect(null, null)(ConfirmAccount);