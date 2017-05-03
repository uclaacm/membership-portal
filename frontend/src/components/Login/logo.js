import React, { PropTypes } from 'react'

class Logo extends React.Component {
    render () {
        return(
            <div className="logo">
                <img className="login-logo" src={this.props.pic}/>
            </div>
        );
    }
}

export default Logo;
