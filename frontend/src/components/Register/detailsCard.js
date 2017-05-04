import React, { PropTypes } from 'react'
import Button from "components/Button/index"

class DetailsCard extends React.Component {
    render () {
        var buttonStyle = '';
        if(this.props.type === "confirm-details") {
            buttonStyle = "green";
        }
        return(
            <div className={"card details-card " + this.props.type}>
                <div className="inner">
                    <p className="header">Account Details</p>

                    <div className="email">
                        <p className="text">School Email</p>
                        <input className="input-large"></input>
                    </div>
                    <div className="align">
                        <p className="text">Major</p>
                        <input className="input-major"></input>
                    </div>
                    <div className="align">
                        <p className="text">Grad Year</p>
                        <input className="input-year"></input>
                    </div>
                    <div className="password">
                        <p className="text">Password</p>
                        <input className="input-large"></input>
                    </div>
                    <Button className="btn" style={buttonStyle || "gray"} text="Finish"/>
                </div>
            </div>
        );
    }
}

export default DetailsCard;
