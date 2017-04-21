import React, { PropTypes } from 'react'

class Settings extends React.Component {
    render () {
        return(
            <div>
                <img className="settings-img" src={this.props.pic} />
            </div>
        );
    }
}

export default Settings;
