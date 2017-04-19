import React, { PropTypes } from 'react'

class Organization extends React.Component {
    render () {
        return(
            <h3>{this.props.org}</h3>
        );
    }
}

export default Organization;
