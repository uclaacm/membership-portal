import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';

export default class EventsModal extends React.Component {
  render() {
    const {
      events, onDelete, onClose, opened,
    } = this.props;

    return opened ? (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>Delete Events</h1>
            <div className="modal-table">
              <table>
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Committee</td>
                    <td>Date</td>
                    <td />
                  </tr>
                </thead>
                <tbody>
                  {
                    events.map(event => (
                      <tr key={event.uuid}>
                        <td>
                          {event.title}
                        </td>
                        <td>{event.committee}</td>
                        <td>{event.startDate.format('dddd, MMMM D YYYY')}</td>
                        <td className="center"><Button color="red" text="Delete" onClick={() => onDelete(event.uuid)} /></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <br />
            <br />
            <br />
            <div className="button-container">
              <Button text="Close" color="red" onClick={onClose} />
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

EventsModal.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
