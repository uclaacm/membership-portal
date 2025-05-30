import React from "react";
import { connect } from 'react-redux';
import { Action } from '../../../reducers';
import Config from '../../../config'
import './style.scss';
import '../../Home/styles.scss';
import moment from "moment";

/* 
      attendancePoints: "",
      committee: "",
      cover: "",
      description: "",
      endDate: "", // endTime
      eventLink: "",
      location: "",
      startDate: "", // startTime
      title: "",
      startTime: "",
*/
class EventCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRsvped: false,
            loading: false,
            isFlipped: false
        };
        this.handleRSVP = this.handleRSVP.bind(this);
        this.handleFlip = this.handleFlip.bind(this);
    }

    handleFlip() {
        this.setState(prev => ({ isFlipped: !prev.isFlipped }));
    }

    getGoogleMapsUrl(location) {
        if (!location) return '#';
        const encodedLocation = encodeURIComponent(location);
        return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    }

    componentDidMount() {
        // Fetch RSVPs when component mounts
        this.props.fetchUserRSVPs();
    }

    componentDidUpdate(prevProps) {
        // Check if this event is in the user's RSVPs
        if (this.props.userRsvps !== prevProps.userRsvps) {
            this.checkRsvpStatus();
        }
    }

    checkRsvpStatus() {
        const { userRsvps, event } = this.props;
        if (userRsvps && userRsvps.size > 0) {
            const hasRsvped = userRsvps.some(rsvp => rsvp.get('event') === event.uuid);
            this.setState({ isRsvped: hasRsvped });
        }
    }
    
    async handleRSVP() {
        this.setState({ loading: true });
        
        try {
            if (this.state.isRsvped) {
                // Cancel RSVP
                const result = await this.props.cancelRSVP(this.props.event.uuid);
                if (result.success) {
                    this.setState({ isRsvped: false });
                }
            } else {
                // Create RSVP
                const result = await this.props.createRSVP(this.props.event.uuid);
                if (result.success) {
                    this.setState({ isRsvped: true });
                }
            }
        } catch (error) {
            console.error('RSVP action failed:', error);
        }
        
        this.setState({ loading: false });
    }

    render() {
        const { event } = this.props;
        const { isRsvped, loading, isFlipped } = this.state;

        console.log(event.description);

        const committeeColorMap = Object.fromEntries(Config.committeeColors);

        return (
            <>
                <div className={`event-container ${isFlipped ? 'is-flipped' : ''}`}>
                    <div className="card-flipper">
                        {/* Front of card */}
                        <div className="card-front">
                            <div className="image-container">
                                <div 
                                    className="cover" 
                                    style={{backgroundImage: `url(${event.cover})`}}
                                    onClick={this.handleFlip}
                                > </div>
                                <div className="pill-shape points-container">{event.attendancePoints} PTS</div>
                            </div>

                            <div className="text-container">
                                <p className="event-title">{event.title}</p>
                                <p className="text">
                                    <a 
                                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.startDate?.format("YYYYMMDDTHHmmss")}/${event.endDate?.format("YYYYMMDDTHHmmss")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="calendar-link"
                                    >
                                        🗓️ {event.startDate?.format("MMMM D, YYYY")}, {event.startDate?.format("h:mm a")}&mdash;{event.endDate?.format("h:mm a")} 
                                    </a>
                                </p>
                                <p className="text">
                                    <a 
                                        className="location-link"
                                        href={this.getGoogleMapsUrl(event.location)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        📍 {event.location} 
                                    </a>
                                </p>
                                <p className="text" style={{color: committeeColorMap[event.committee]}}>{event.committee}</p>
                                <div className={`pill-shape rsvp ${isRsvped ? 'rsvped' : ''} ${loading ? 'loading' : ''}`} onClick={this.handleRSVP}>
                                    {loading ? 'Loading...' : isRsvped ? 'Cancel RSVP' : 'RSVP'}
                                </div>
                            </div>
                        </div>

                        {/* Back of card */}
                        <div className="card-back">
                            <div className="back-content">
                                <button className="flip-back-btn" onClick={this.handleFlip}>
                                    <i className="fa fa-arrow-left" /> Back
                                </button>
                                <h3>{event.title}</h3>
                                <div className="description-scroll">
                                    <p>{event.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({
    userRsvps: state.RSVP.get('userRsvps')
});

const mapDispatchToProps = dispatch => ({
    fetchUserRSVPs: () => dispatch(Action.FetchUserRSVPs()),
    createRSVP: (eventUuid) => dispatch(Action.CreateRSVP(eventUuid)),
    cancelRSVP: (eventUuid) => dispatch(Action.CancelRSVP(eventUuid))
});

export default connect(mapStateToProps, mapDispatchToProps)(EventCard);