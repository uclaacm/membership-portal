import React, { PropTypes } from 'react'

class Username extends React.Component {
    render () {
        return (
            <div>
                <h3 className="side-tag username Display-2White">{this.props.username}</h3>
            </div>
        );
    }
};

export default Username;
