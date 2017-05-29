import React from 'react'

export default class PointsBar extends React.Component {
    render() {
        var barWidth1 = 2.5*this.props.points + 'px';
        var barWidth2 = 2.5*(100 - this.props.points) + 'px';
        return (
            <div className="points-bar">
                <p className="pts points-earned" style={{width:barWidth1}}></p>
                <p className="pts points-left" style={{width:barWidth2}}></p>
            </div>
        );
    }
}