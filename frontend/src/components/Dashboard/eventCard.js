import React, { PropTypes } from 'react'
import Button from 'components/Button/index'
import DOMPurify from 'dompurify';

export default class EventCard extends React.Component {
    render () {
        return(
            <div className="event-card">
                <div className="cover" style={{ backgroundImage: 'url('+this.props.event.img+')' }}></div>
                <div className="content">
                    <h2>{this.props.event.title}</h2>
                    <h3>ACM {this.props.event.org}</h3>
                    <div className="subcontent">
                        <span className="time">{this.props.event.time}</span> | {this.props.event.location}
                    </div>
                </div>
            </div>
        );
    }
}