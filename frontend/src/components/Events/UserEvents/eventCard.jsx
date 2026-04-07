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
    static EventCardState = {
        AVAILABLE: 'AVAILABLE',          
        RSVPED: 'RSVPED',                
        LOADING: 'LOADING',               
        CHECKED_IN: 'CHECKED_IN',        
    };

    constructor(props) {
        super(props);
        this.state = {
            isRsvped: false,
            loading: false,
            isFlipped: false,
            isCheckInned: this.isEventCheckedIn(props),
        };
        this.handleRSVP = this.handleRSVP.bind(this);
        this.handleFlip = this.handleFlip.bind(this);
    }

    isEventCheckedIn(props = this.props) {
        console.log('Checking if event is checked in with props:', props);
        const { checkedInEvents, event } = props;
        return checkedInEvents && checkedInEvents.has(event.uuid);
    }

    getEventCardState() {
        if (this.state.isCheckInned) {
            return EventCard.EventCardState.CHECKED_IN;
        }
        if (this.state.loading) {
            return EventCard.EventCardState.LOADING;
        }
        if (this.state.isRsvped) {
            return EventCard.EventCardState.RSVPED;
        }
        return EventCard.EventCardState.AVAILABLE;
    }

    getButtonText() {
        const state = this.getEventCardState();
        switch (state) {
            case EventCard.EventCardState.CHECKED_IN:
                return '✓ Checked In';
            case EventCard.EventCardState.LOADING:
                return 'Loading...';
            case EventCard.EventCardState.RSVPED:
                return 'Cancel RSVP';
            default:
                return 'RSVP';
        }
    }

    isRSVPDisabled() {
        return this.state.isCheckInned || this.state.loading;
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
        this.props.fetchUserRSVPs();
        this.props.fetchCheckedInEvents();
    }

    componentDidUpdate(prevProps) {
        if (this.props.checkedInEvents !== prevProps.checkedInEvents) {
            const isCheckInned = this.isEventCheckedIn();
            this.setState({ isCheckInned });
        }

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
        // Prevent RSVP action if checked in
        if (this.state.isCheckInned) {
            return;
        }

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
                console.log(result); 
                if (result.success) {
                    this.setState({ isRsvped: true });
                }
            }
        } catch (error) {
            console.error('RSVP action failed:', error);
        }
        
        this.setState({ loading: false });
    }

    getPlainTextDescription(description) {
        // Strips HTML tags while preserving basic formatting (line breaks)
        if (description == null) return '';
        if (typeof description !== 'string') return String(description);
        const withLineBreaks = description
            .replace(/<\s*br\s*\/?\s*>/gi, '\n')
            .replace(/<\s*\/\s*p\s*>/gi, '\n\n')
            .replace(/<\s*\/\s*div\s*>/gi, '\n\n');

        if (typeof DOMParser === 'undefined') {
            return withLineBreaks.replace(/\n{3,}/g, '\n\n').trim();
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(withLineBreaks, 'text/html');
        const plainText = doc.body.textContent || '';

        return plainText.replace(/\n{3,}/g, '\n\n').trim();
    }

    render() {
        const { event } = this.props;
        const { isFlipped } = this.state;
        const currentState = this.getEventCardState();
        const buttonText = this.getButtonText();
        const isDisabled = this.isRSVPDisabled();

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
                                
                                {/* RSVP Button with enum-based states */}
                                <div 
                                    className={`pill-shape rsvp ${currentState.toLowerCase()} ${isDisabled ? 'disabled' : ''}`}
                                    onClick={this.handleRSVP}
                                    style={{
                                        opacity: isDisabled ? 0.6 : 1,
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {buttonText}
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
                                    <p>{this.getPlainTextDescription(event.description)}</p>
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
    userRsvps: state.RSVP.get('userRsvps'),
    checkedInEvents: state.CheckIn.get('checkedInEvents'),  
});

const mapDispatchToProps = dispatch => ({
    fetchUserRSVPs: () => dispatch(Action.FetchUserRSVPs()),
    fetchCheckedInEvents: () => dispatch(Action.FetchCheckedInEvents()),  
    createRSVP: (eventUuid) => dispatch(Action.CreateRSVP(eventUuid)),
    cancelRSVP: (eventUuid) => dispatch(Action.CancelRSVP(eventUuid))
});

export default connect(mapStateToProps, mapDispatchToProps)(EventCard);