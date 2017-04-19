import React, { PropTypes } from 'react'

class Points extends React.Component {
    render () {
        return(
            <h3 className="side-tag">{this.props.points}</h3>
        );
    }
}

export default Points;
