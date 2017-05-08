import React, { PropTypes } from 'react'

class Organization extends React.Component {
    render () {
        return(
            <div>
                <h3 className="side-tag org Title-2White">{this.props.org}</h3>
            </div>
        );
    }
}

export default Organization;
