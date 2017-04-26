import React, { PropTypes } from 'react'

class SingleDay extends React.Component {
    render () {
        return(
            <div>
                <h2 className="data">{this.props.date}</h2>
                <p>{this.props.event}</p>
            </div>
        );
    }
}

export default SingleDay;
