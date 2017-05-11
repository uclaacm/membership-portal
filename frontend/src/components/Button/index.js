import React, { PropTypes } from 'react'


class Button extends React.Component {
    
    render () {
        return(
            <div className={"button-component " + this.props.className}>
                <button className={"generic-button " + this.props.style}><i className={"fa " + this.props.icon + " button-icon"} aria-hidden="true"></i>{this.props.text}</button>
            </div>
        );
    }
}

export default Button;



/*var barWidth1 = 2.5*this.props.points + 'px';
        var barWidth2 = 2.5*(100 - this.props.points) + 'px';
        return (
            <div className="points-bar">
                <p className="pts points-earned" style={{width:barWidth1}}></p>
                <p className="pts points-left" style={{width:barWidth2}}></p>
            </div>
        );*/