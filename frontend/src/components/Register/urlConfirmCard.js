import React, { PropTypes } from 'react'
import Button from 'components/Button/index'

class UrlConfirmCard extends React.Component {
    
    render () {
        return(
                <div className="card url-confirm-card">
                    <p className="question">What's your Facebook URL?</p>
                    <p className="fb-url">https://www.facebook.com/</p><input></input><br></br>
                    <Button className="btn" style="blue" text="Next"/><br></br>
                    <a href="#">Why do you guys need my Facebook URL?</a>
                </div>
        );
    }
}

export default UrlConfirmCard;
