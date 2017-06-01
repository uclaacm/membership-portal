import React from 'react';
import {connect} from 'react-redux';
import ResetPasswordComponent from 'components/ResetPassword';

class ResetPassword extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ResetPasswordComponent />
        );
    }
}

export default connect(null, null)(ResetPassword);