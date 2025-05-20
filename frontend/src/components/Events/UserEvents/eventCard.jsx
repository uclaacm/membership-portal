import React from "react";
import { connect } from 'react-redux';
import { Action } from '../../../reducers';
import styles from './styles.scss';
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
            loading: false
        };
        this.handleRSVP = this.handleRSVP.bind(this);
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
        const { isRsvped, loading } = this.state;
        return (
            <>
                <div className="event-container">
                    <div className="image-container">
                        <div className="cover" style={{backgroundImage: `url(${event.cover})`}}> </div>
                        <div className="pill-shape points-container">{event.attendancePoints} PTS</div>
                    </div>

                    <div className="text-container">
                        <p className="event-title">{event.title}</p>
                        <p className="text">{event.startDate?.format("MMMM D, YYYY")}, {event.startDate?.format("h:mm a")}&mdash;{event.endDate?.format("h:mm a")}</p>
                        <p className="text">{event.location}</p>
                        <p className="text">{event.committee}</p>
                    
                        <div 
                            className={`pill-shape rsvp ${isRsvped ? 'rsvped' : ''} ${loading ? 'loading' : ''}`}
                            onClick={this.handleRSVP}
                        >
                            {loading ? 'Loading...' : isRsvped ? 'Cancel RSVP' : 'RSVP'}
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
