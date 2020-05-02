import React from 'react';
import Button from 'components/Button';
import EventsModal from 'components/Modal/eventsModal';
import ConfirmationModal from 'components/Modal/confirmationModal';
import PropTypes from 'prop-types';

class ControlPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      showEventsModal: false,
      showConfirmationModal: false,
      deleteUUID: null,
    };
  }

  openEventsModal = () => {
    this.setState(prev => ({ showEventsModal: true }));
  }

  closeEventsModal = () => {
    this.setState(prev => ({ showEventsModal: false }));
  }

  openConfirmationModal = (uuid) => {
    this.setState(prev => ({ showConfirmationModal: true, deleteUUID: uuid }));
  }

  closeConfirmationModal = () => {
    this.setState(prev => ({ showConfirmationModal: false }));
  }

  triggerDelete = () => {
    const { deleteEvent } = this.props;
    const { deleteUUID } = this.state;
    deleteEvent(deleteUUID);
    this.closeConfirmationModal();
  }

  render() {
    const { logout, events } = this.props;
    const { showEventsModal, showConfirmationModal } = this.state;
    return (

      <div className="control-panel-wrapper">
        <h1>Control Panel</h1>
        <div className="form-elem">
          <Button
            className="signout-action-button"
            color="blue"
            text="Sign Out"
            onClick={logout}
          />
          <Button
            className="deleteevents-action-button"
            color="red"
            text="Delete Events"
            onClick={this.openEventsModal}
          />
        </div>
        <div className="form-elem">
          <h1>Create a milestone</h1>
          <input type="text" name="name" placeholder="Quarter (e.g. Fall 2017)" />
        </div>
        <div className="form-elem">
          <Button
            className="control-panel-action-button"
            color="blue"
            text="Create"
          />
        </div>

        <div className="form-elem">
          <h1 className="DisplayPrimary">Event Analytics</h1>
          <select className="Headline-2Secondary">
            <option>General</option>
            <option>AI</option>
            <option>Board</option>
            <option>Hack</option>
            <option>ICPC</option>
            <option>NetSec</option>
            <option>Studio</option>
            <option>W</option>
          </select>
        </div>

        <EventsModal
          opened={showEventsModal}
          events={events}
          onDelete={this.openConfirmationModal}
          onClose={this.closeEventsModal}
        />

        <ConfirmationModal
          title="Delete Event"
          message="Are you sure you want to delete this event? This can't be undone!"
          opened={showConfirmationModal}
          cancel={this.closeConfirmationModal}
          submit={this.triggerDelete}
        />
      </div>
    );
  }
}

ControlPanel.propTypes = {
  logout: PropTypes.func.isRequired,
  deleteEvent: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ControlPanel;
