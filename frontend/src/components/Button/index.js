import React, { PropTypes } from 'react'


class Button extends React.Component {
    
    render () {
        // var backgroundColor = this.props.backgroundColor;
        // var borderColor = this.props.borderColor;
        // var text = this.props.text;

        // const colorScheme = styles[this.props.color];
        // if(this.props.color ==='blue') {
        //     colorScheme = styles.blue;
        // }

        // if(this.props.color ==='green') {
        //     colorScheme = styles.blue;
        // }

        // if(this.props.color ==='red') {
        //     colorScheme = styles.blue;
        // }

//http://stackoverflow.com/questions/32230635/passing-in-class-names-to-react-components
        return(
            <div>
                <button className={"generic-button " + this.props.style}>{this.props.text}</button>
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