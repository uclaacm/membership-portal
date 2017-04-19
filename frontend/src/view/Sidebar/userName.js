
import React, { PropTypes } from 'react'

class UserName extends React.Component {
    render () {
        return (
            <div>
                <h3>{this.props.userName}</h3>
            </div>
        );
    }
};

export default UserName;
