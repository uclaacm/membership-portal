import React, { PropTypes } from 'react'

class Position extends React.Component {
    render() {
        return (
            <div>
                <h3 className="side-tag pos">{this.props.pos}</h3>
            </div>
        );
    }
}

export default Position;
