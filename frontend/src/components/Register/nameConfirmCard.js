import React, { PropTypes } from 'react'
import Button from "components/Button/index"

class NameConfirmCard extends React.Component {
    
    render () {
        return(
                <div className="card name-confirm-card">
                    <p className="question">Is this your name?</p>
                    <p className="name">{this.props.name}</p>
                    <Button className="btn" style="green" text="Yup, it is!"/>
                    <Button className="btn" style="red" text="No, it's not."/>
                </div>
        );
    }
}

export default NameConfirmCard;
