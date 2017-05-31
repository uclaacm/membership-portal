import React from 'react'
import Config from 'config'
import Button from 'components/Button/index'
import FacebookLogin from 'react-facebook-login';

export default class FacebookLoginCard extends React.Component {
    render () {
        return(
            <div className="card fb-login-card">
                <p className="question">Register</p>
                <div className="button-component">
                    <FacebookLogin
                        appId={Config.facebook.appId} 
                        fields="name,email"
                        autoload={true}
                        cssClass="generic-button fb-login-button blue"
                        icon="fa-facebook"
                        callback={this.props.facebookCallback} />
                </div>
            </div>
        );
    }
}