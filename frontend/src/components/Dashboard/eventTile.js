import React, { PropTypes } from 'react'

class EventTile extends React.Component {
    render () {
        return(
            <div className="event-tile">
                <div className="img-wrapper">
                    <img className="event-img" src={this.props.img} />
                </div>
                <div className="event-info-wrapper">
                    <div className="event-info-left">
                        <span className="event-info Title-2Secondary">{this.props.org}</span>
                        <span className="event-info Headline-2Primary">{this.props.title}</span>
                    </div>
                    <div className="event-info-right">
                        <div className="event-info">
                            <i className="fa fa-clock-o event-icon" aria-hidden="true"></i>
                            <span className="Subheader-2Secondary">{this.props.time}</span>
                        </div>
                        <div className="event-info">
                            <i className="fa fa-map-marker event-icon" aria-hidden="true"></i>
                            <span className="Subheader-2Secondary">{this.props.location}</span>  
                        </div>
                    </div>
                </div>
 
            </div>
        );
    }
}

export default EventTile;


