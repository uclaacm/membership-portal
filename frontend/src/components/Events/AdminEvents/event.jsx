import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Action } from '../../../reducers';

class AdminEventCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showRsvpData: false,
      rsvpData: null,
      rsvps: 0,
      emailsCopied: false,
    };
    this.editEvent = this.editEvent.bind(this);
    this.handleViewRsvps = this.handleViewRsvps.bind(this);
    this.copyEmailsToClipboard = this.copyEmailsToClipboard.bind(this);
  }

  async componentDidMount() {
    const { event, fetchEventRSVPs } = this.props;
    // Fetch RSVPs when component mounts
    if (event && event.uuid) {
      const response = await fetchEventRSVPs(event.uuid);
      if (response.success && response.rsvps) {
        this.setState({ rsvps: response.rsvps.length });
      }
    }
  }

  editEvent(e) {
    const { handleEditClick, event } = this.props;
    // Don't edit if clicking on the view RSVPs button
    if (e.target.closest('.view-rsvps-btn')) {
      e.stopPropagation();
      return;
    }
    if (handleEditClick) handleEditClick(event);
  }

  copyEmailsToClipboard(e) {
    const { rsvpData } = this.state;
    if (!rsvpData || rsvpData.length === 0) return;
    e.stopPropagation();
    const emails = rsvpData.map(rsvp => rsvp.user.email).join(', ');
    // eslint-disable-next-line no-undef
    navigator.clipboard.writeText(emails);
    // Set copied state
    this.setState({ emailsCopied: true });
    // Reset after 2 seconds
    setTimeout(() => {
      this.setState({ emailsCopied: false });
    }, 2000);
  }

  async handleViewRsvps(e) {
    const { fetchEventRSVPs, event } = this.props;
    const { showRsvpData } = this.state;
    e.stopPropagation(); // Prevent the edit event from firing

    if (showRsvpData) {
      // Hide the data
      this.setState({ showRsvpData: false });
      return;
    }

    this.setState({ loading: true });
    try {
      const response = await fetchEventRSVPs(event.uuid);
      if (response.success && response.rsvps) {
        this.setState({
          rsvpData: response.rsvps,
          showRsvpData: true,
          loading: false,
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (err) {
      this.setState({ loading: false });
    }
  }

  /* can add a button here to copy all emails from the rsvp */
  render() {
    const { event } = this.props;
    const {
      rsvps, showRsvpData, rsvpData, loading, emailsCopied,
    } = this.state;

    let buttonText = 'View All RSVPs';
    if (loading) {
      buttonText = 'Loading...';
    } else if (showRsvpData) {
      buttonText = 'Hide RSVPs';
    }

    return (
      <div className="admin-event-tile" onClick={this.editEvent}>
        <div className="main-content">
          <div className="top">
            <div className="cover" style={{ backgroundImage: `url(${event.cover})` }} />
            <div className="event-header">
              <span className="event-title Headline-2Primary">{event.title}</span>
              <br />
              <span className="event-committee Title-2Secondary">{event.committee}</span>
            </div>
          </div>
          <div className="rsvp-section">
            <div className="rsvp-count">
              RSVPs:
              {' '}
              {rsvps || 0}
            </div>
            <button
              type="button"
              className="view-rsvps-btn"
              onClick={this.handleViewRsvps}
              disabled={loading}
            >
              {buttonText}
            </button>
          </div>
        </div>

        {showRsvpData && rsvpData && (
          <div className="rsvp-display">
            <div className="rsvp-header-section">
              <h4 className="rsvp-header">
                RSVPs (
                {rsvpData.length}
                {' '}
                total)
              </h4>
              <button type="button" className="copy-email-button" onClick={this.copyEmailsToClipboard}>
                {emailsCopied ? 'Copied!' : 'Copy All Emails'}
              </button>
            </div>
            {rsvpData.length === 0 ? (
              <p className="no-rsvps">No RSVPs yet for this event.</p>
            ) : (
              <div className="rsvp-list">
                {rsvpData.map(rsvp => (
                  <div key={rsvp.uuid} className="rsvp-card">
                    <img
                      src={rsvp.user.picture}
                      alt={`${rsvp.user.firstName} ${rsvp.user.lastName}`}
                      className="rsvp-avatar"
                    />
                    <div className="rsvp-info">
                      <div className="rsvp-name">
                        {rsvp.user.firstName}
                        {' '}
                        {rsvp.user.lastName}
                      </div>
                      <div className="rsvp-email">{rsvp.user.email}</div>
                      <div className="rsvp-details">
                        Year
                        {' '}
                        {rsvp.user.year}
                        {' '}
                        •
                        {' '}
                        {rsvp.user.major}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <details className="json-toggle">
              <summary>View Raw JSON</summary>
              <pre>{JSON.stringify({ error: null, rsvps: rsvpData }, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    );
  }
}

AdminEventCard.propTypes = {
  event: PropTypes.shape({
    uuid: PropTypes.string,
    cover: PropTypes.string,
    title: PropTypes.string,
    committee: PropTypes.string,
  }).isRequired,
  handleEditClick: PropTypes.func,
  fetchEventRSVPs: PropTypes.func.isRequired,
};

AdminEventCard.defaultProps = {
  handleEditClick: null,
};

const mapStateToProps = state => ({
  eventRsvps: state.RSVP.get('eventRsvps'),
});

const mapDispatchToProps = dispatch => ({
  fetchEventRSVPs: eventUuid => dispatch(Action.FetchEventRSVPs(eventUuid)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminEventCard);
