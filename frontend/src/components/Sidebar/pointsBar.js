import React from 'react'

export default class PointsBar extends React.Component {
    render() {
        var barWidth1 = (this.props.end === 0 ? "100%" : (100.0 * (this.props.points - this.props.start) / (this.props.end - this.props.start)) + "%");

        return (
            <div className="points-bar">
                <div className="pts points-earned" style={{width:barWidth1}}></div>
            </div>
        );
    }
}