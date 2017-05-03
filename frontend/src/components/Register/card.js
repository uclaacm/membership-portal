import React, { PropTypes } from 'react'
import Button from "components/Button/index"

class Card extends React.Component {
    
    render () {
        return(
            <div className="card">
                <Button style="blue" text="Next"/>
            </div>
        );
    }
}

export default Card;
