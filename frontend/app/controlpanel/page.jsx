import React from 'react';
import PropTypes from 'prop-types';

import Topbar from 'containers/topbar';
import ControlPanel from './controlPanel';

export default class ControlPanelComponent extends React.Component {
  render() {
    const {
      isAdmin,
      isOfficer,
      logout,
      userEmail,
      events,
      deleteEvent,
      images,
      deleteImage,
      officerCommittees,
      admins,
      removeAdmin,
      addAdmin,
      reassignAdmin,
      isSuperAdmin,
      changeOneClickPassword,
      oneClickUpdated,
      oneClickUpdateSuccess,
      oneClickError,
      eventDeleteError,
      imageDeleteError,
      adminView,
      toggleAdminView,
    } = this.props;
    return (
      <div className="controlpanel">
        <Topbar />
        {/* <Sidebar /> */}
        <ControlPanel
          isAdmin={isAdmin}
          isOfficer={isOfficer}
          logout={logout}
          userEmail={userEmail}
          events={events}
          deleteEvent={deleteEvent}
          images={images}
          deleteImage={deleteImage}
          officerCommittees={officerCommittees}
          admins={admins}
          removeAdmin={removeAdmin}
          addAdmin={addAdmin}
          reassignAdmin={reassignAdmin}
          isSuperAdmin={isSuperAdmin}
          changeOneClickPassword={changeOneClickPassword}
          oneClickUpdated={oneClickUpdated}
          oneClickUpdateSuccess={oneClickUpdateSuccess}
          oneClickError={oneClickError}
          eventDeleteError={eventDeleteError}
          imageDeleteError={imageDeleteError}
          adminView={adminView}
          toggleAdminView={toggleAdminView}
        />
      </div>
    );
  }
}

ControlPanelComponent.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isOfficer: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  events: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
  })).isRequired,
  deleteEvent: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
  })).isRequired,
  deleteImage: PropTypes.func.isRequired,
  officerCommittees: PropTypes.arrayOf(PropTypes.string).isRequired,
  admins: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string,
  })).isRequired,
  removeAdmin: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  reassignAdmin: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  changeOneClickPassword: PropTypes.func.isRequired,
  oneClickUpdated: PropTypes.bool.isRequired,
  oneClickUpdateSuccess: PropTypes.bool.isRequired,
  oneClickError: PropTypes.string.isRequired,
  eventDeleteError: PropTypes.string,
  imageDeleteError: PropTypes.string,
  adminView: PropTypes.bool.isRequired,
  toggleAdminView: PropTypes.func.isRequired,
};
