import React from 'react'
import Config from 'config'

export default class Organization extends React.Component {
    render () {
        return(
            <div>
                <h3 className="side-tag org Title-2White">{this.props.org}</h3>
            </div>
        );
    }
}