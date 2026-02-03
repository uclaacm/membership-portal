import React from 'react';
import { connect } from 'react-redux';
import { Action } from '../../../reducers';

class AdminEventCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.editEvent = this.editEvent.bind(this);
  }

  async componentDidMount() {
    // Fetch RSVPs when component mounts
    if (this.props.event && this.props.event.uuid) {
      const response = await this.props.fetchEventRSVPs(this.props.event.uuid);
      if (response.success && response.rsvps) {
        this.setState({ rsvps: response.rsvps.length });
      }
    }
  }

  editEvent(e) {
    if (this.props.handleEditClick) this.props.handleEditClick(this.props.event);
  }

  render() {
    const { event } = this.props;
    const { rsvps } = this.state;

    return (
      <div className="admin-event-tile" onClick={this.editEvent}>
        <div className="top">
          <div className="cover" style={{ backgroundImage: `url(${event.cover})` }} />
          <div className="event-header">
            <span className="event-title Headline-2Primary">{event.title}</span>
            <br />
            <span className="event-committee Title-2Secondary">{event.committee}</span>
          </div>
        </div>
        <div className="rsvp-count">
          RSVPs: {rsvps|| 0}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  eventRsvps: state.RSVP.get('eventRsvps')
});

const mapDispatchToProps = dispatch => ({
  fetchEventRSVPs: (eventUuid) => dispatch(Action.FetchEventRSVPs(eventUuid))
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminEventCard);
