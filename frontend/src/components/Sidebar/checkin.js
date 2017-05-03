import React, { PropTypes } from 'react'

class Checkin extends React.Component {
    render () {
        return(
            <div>
                <button className="side-tag check-in"><img className="checkin-button" src="http://www.freeiconspng.com/uploads/settings-icon-26.png"/>Check In</button>
            </div>
        );
    }
}

export default Checkin;
