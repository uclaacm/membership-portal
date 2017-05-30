// import FB from 'fb'
import React from 'react'
import Config from 'config'
import Button from 'components/Button/index'

export default class UrlConfirmCard extends React.Component {
    constructor(props) {
        super(props);

        // this.state = { response: null };
        // FB.init({
        //     appId: Config.facebook.appId,
        //     cookie: true,
        //     xfbml: true,
        //     version: 'v2.8'
        // });

        // FB.AppEvents.logPageView();
        // FB.getLoginStatus(function(response) {
        //     this.setState({ response });
        // });
    }

    render () {

        return(
            <div className="card url-confirm-card">
                <p className="question">What's your Facebook URL?</p>
                {/*{ this.state.response }*/}
                <p className="fb-url">https://www.facebook.com/</p><input></input><br></br>
                <Button className="btn" style="blue" text="Next"/><br></br>
                <a href="#">Why do you guys need my Facebook URL?</a>
            </div>
        );
    }
}