'use client';

import React from "react";
import Config from '@/lib/config';
import './style.scss';
import moment from "moment";
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import createRSVP from '@/app/actions/rsvp/createRSVP';
import cancelRSVP from '@/app/actions/rsvp/cancelRSVP';
import fetchCheckedInEvents from '@/app/actions/attendance/fetchCheckedInEvents';

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
            isCheckInned: false,
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

    getEventCardState() {
        if (this.state.isCheckInned) return EventCard.EventCardState.CHECKED_IN;
        if (this.state.loading) return EventCard.EventCardState.LOADING;
        if (this.state.isRsvped) return EventCard.EventCardState.RSVPED;
        return EventCard.EventCardState.AVAILABLE;
    }

    getButtonText() {
        switch (this.getEventCardState()) {
            case EventCard.EventCardState.CHECKED_IN: return '✓ Checked In';
            case EventCard.EventCardState.LOADING: return 'Loading...';
            case EventCard.EventCardState.RSVPED: return 'Cancel RSVP';
            default: return 'RSVP';
        }
    }

    isRSVPDisabled() {
        return this.state.isCheckInned || this.state.loading;
    }

    getPlainTextDescription(description) {
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

    async componentDidMount() {
        const [rsvpResult, checkInResult] = await Promise.all([
            fetchUserRSVPs(),
            fetchCheckedInEvents(),
        ]);
        if (rsvpResult.success && rsvpResult.rsvps) {
            const hasRsvped = rsvpResult.rsvps.some(rsvp => rsvp.event === this.props.event.uuid);
            this.setState({ isRsvped: hasRsvped });
        }
        if (checkInResult.success && checkInResult.eventUuids) {
            this.setState({ isCheckInned: checkInResult.eventUuids.has(this.props.event.uuid) });
        }
    }

    async handleRSVP() {
        if (this.isRSVPDisabled()) return;

        this.setState({ loading: true });

        try {
            if (this.state.isRsvped) {
                const result = await cancelRSVP(this.props.event.uuid);
                if (result.success) {
                    this.setState({ isRsvped: false });
                }
            } else {
                const result = await createRSVP(this.props.event.uuid);
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
                                    style={{backgroundImage: `url(${event.cover || '/logo.png'})`}}
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

export default EventCard;