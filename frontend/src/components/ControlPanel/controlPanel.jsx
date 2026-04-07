import React from 'react';
import Button from 'components/Button';
import BannerMessage from 'components/BannerMessage';
import EventsModal from 'components/Modal/eventsModal';
import ImagesModal from 'components/Modal/imagesModal';
import AdminsModal from 'components/Modal/adminsModal';
import ReassignModal from 'components/Modal/reassignModal';
import OneClickPasswordModal from 'components/Modal/oneClickPasswordModal';
import ConfirmationModal from 'components/Modal/confirmationModal';
import ChangeToAdmin from '../Profile/ChangeToAdmin';
import PropTypes from 'prop-types';

class ControlPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      showEventsModal: false,
      showEventsConfirmationModal: false,
      deleteUUID: null,

      showImagesModal: false,
      showImagesConfirmationModal: false,
      deleteImageUUID: null,

      showAdminsModal: false,
      showReassignModal: false,
      showRemoveAdminConfirmationModal: false,
      showReassignAdminConfirmationModal: false,
      removeEmail: null,
      reassignEmail: null,

      showOneClickPasswordModal: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.oneClickUpdated && nextProps.oneClickUpdateSuccess) {
      this.closeOneClickPasswordModal();
    }
  }

  openEventsModal = () => this.setState({ showEventsModal: true });
  closeEventsModal = () => this.setState({ showEventsModal: false });
  openEventsConfirmationModal = uuid => this.setState({ showEventsConfirmationModal: true, deleteUUID: uuid });
  closeEventsConfirmationModal = () => this.setState({ showEventsConfirmationModal: false });

  openImagesModal = () => this.setState({ showImagesModal: true });
  closeImagesModal = () => this.setState({ showImagesModal: false });
  openImagesConfirmationModal = uuid => this.setState({ showImagesConfirmationModal: true, deleteImageUUID: uuid });
  closeImagesConfirmationModal = () => this.setState({ showImagesConfirmationModal: false });

  openAdminsModal = () => this.setState({ showAdminsModal: true });
  closeAdminsModal = () => this.setState({ showAdminsModal: false });
  openReassignModal = () => this.setState({ showReassignModal: true });
  closeReassignModal = () => this.setState({ showReassignModal: false });
  openRemoveAdminConfirmationModal = email => this.setState({ showRemoveAdminConfirmationModal: true, removeEmail: email });
  closeRemoveAdminConfirmationModal = () => this.setState({ showRemoveAdminConfirmationModal: false });
  openReassignAdminConfirmationModal = email => this.setState({ showReassignAdminConfirmationModal: true, reassignEmail: email });
  closeReassignAdminConfirmationModal = () => this.setState({ showReassignAdminConfirmationModal: false });

  openOneClickPasswordModal = () => this.setState({ showOneClickPasswordModal: true });
  closeOneClickPasswordModal = () => this.setState({ showOneClickPasswordModal: false });

  triggerDeleteEvent = () => {
    this.props.deleteEvent(this.state.deleteUUID);
    this.closeEventsConfirmationModal();
  };

  triggerDeleteImage = () => {
    this.props.deleteImage(this.state.deleteImageUUID);
    this.closeImagesConfirmationModal();
  };

  triggerRemoveAdmin = () => {
    this.props.removeAdmin(this.state.removeEmail);
    this.closeRemoveAdminConfirmationModal();
  };

  triggerReassignAdmin = () => {
    this.props.reassignAdmin(this.state.reassignEmail);
    this.closeReassignAdminConfirmationModal();
  };

  triggerAddAdmin = email => this.props.addAdmin(email);

  triggerChangePassword = (oldPassword, newPassword) => {
    this.props.changeOneClickPassword(oldPassword, newPassword);
  };

  extractImageUuidFromCover = (cover) => {
    if (!cover || typeof cover !== 'string') return null;
    const match = cover.match(/\/image\/raw\/([0-9a-f-]{36})/i);
    return match ? match[1] : null;
  };

  render() {
    const {
      logout, events, admins, images, isSuperAdmin, isOfficer, isAdmin,
      officerCommittees,
      userEmail, adminView, toggleAdminView,
      oneClickUpdated, oneClickUpdateSuccess, oneClickError,
      eventDeleteError, imageDeleteError,
    } = this.props;

    const {
      showEventsModal, showEventsConfirmationModal,
      showImagesModal, showImagesConfirmationModal,
      showAdminsModal, showReassignModal,
      showRemoveAdminConfirmationModal, showReassignAdminConfirmationModal,
      showOneClickPasswordModal,
    } = this.state;

    const isCommitteeScopedOfficer = isOfficer && !isAdmin;
    const visibleEvents = isCommitteeScopedOfficer
      ? events.filter((event) => officerCommittees.includes(event.committee))
      : events;

    const allowedImageUuids = new Set(
      visibleEvents
        .map((event) => this.extractImageUuidFromCover(event.cover))
        .filter(Boolean),
    );

    const visibleImages = isCommitteeScopedOfficer
      ? images.filter((image) => allowedImageUuids.has(image.uuid))
      : images;

    const deleteErrorMessage = eventDeleteError || imageDeleteError;
    let roleMessage = 'You are signed in as a member.';
    if (isAdmin) {
      roleMessage = 'You are signed in as admin';
    } else if (isOfficer) {
      if (officerCommittees.length > 0) {
        roleMessage = `You are signed in as an Officer for ${officerCommittees.join(', ')}`;
      } else {
        roleMessage = 'You are signed in as an Officer';
      }
    }

    return (
      <div className="control-panel-wrapper">
        <BannerMessage
          showing={!!deleteErrorMessage}
          success={false}
          message={deleteErrorMessage}
        />

        <BannerMessage
          showing={oneClickUpdated}
          success={oneClickUpdateSuccess}
          message={oneClickUpdateSuccess ? 'Password updated successfully' : oneClickError}
        />

        <h1 className="DisplayPrimary panel-title">Control Panel</h1>
        <p className="panel-subtitle">Manage events, members, and portal settings. {roleMessage}</p>

        <div className="panel-section">
          <h2 className="section-title">User Management</h2>
          <div className="panel-grid">
            <div className="panel-card">
              <span className="card-title">Assign Role</span>
              <span className="card-desc">Promote a member to Officer or Admin. Officers get committee-scoped access; Admin requires a password.</span>
              <ChangeToAdmin />
            </div>

            {isSuperAdmin && (
              <div className="panel-card">
                <span className="card-title">Manage Admins</span>
                <span className="card-desc">Add or remove admins and reassign the Super Admin role.</span>
                <Button color="red" text="Manage Admins" onClick={this.openAdminsModal} />
              </div>
            )}
          </div>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Content</h2>
          <div className="panel-grid">
            <div className="panel-card">
              <span className="card-title">Events</span>
              <span className="card-desc">Delete events from the portal.</span>
              <Button color="red" text="Manage Events" onClick={this.openEventsModal} />
            </div>

            <div className="panel-card">
              <span className="card-title">Images</span>
              <span className="card-desc">Remove uploaded portal images. </span>
              <Button color="red" text="Manage Images" onClick={this.openImagesModal} />
            </div>

            <div className="panel-card">
              <span className="card-title">One-Click API</span>
              <span className="card-desc">Update the password for the one-click attendance API.</span>
              <Button color="red" text="Update Password" onClick={this.openOneClickPasswordModal} />
            </div>
          </div>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Session</h2>
          <div className="panel-grid">
            <div className="panel-card">
              <span className="card-title">View Mode</span>
              <span className="card-desc">
                {adminView
                  ? `Currently viewing as ${isOfficer ? 'officer' : 'admin'}.`
                  : 'Currently viewing as a member.'}
              </span>
              <Button
                color="blue"
                text={adminView ? 'Switch to Member View' : `Switch to ${isOfficer ? 'Officer' : 'Admin'} View`}
                onClick={toggleAdminView}
              />
            </div>

            <div className="panel-card">
              <span className="card-title">Sign Out</span>
              <span className="card-desc">Log out of your account.</span>
              <Button color="red" text="Sign Out" onClick={logout} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <EventsModal
          opened={showEventsModal}
          events={visibleEvents}
          onDelete={this.openEventsConfirmationModal}
          onClose={this.closeEventsModal}
        />

        <ImagesModal
          opened={showImagesModal}
          images={visibleImages}
          onDelete={this.openImagesConfirmationModal}
          onClose={this.closeImagesModal}
        />

        <ConfirmationModal
          title="Delete Event"
          message="Are you sure you want to delete this event? This can't be undone!"
          opened={showEventsConfirmationModal}
          cancel={this.closeEventsConfirmationModal}
          submit={this.triggerDeleteEvent}
        />

        <ConfirmationModal
          title="Delete Image"
          message="Are you sure you want to delete this image? This can't be undone!"
          opened={showImagesConfirmationModal}
          cancel={this.closeImagesConfirmationModal}
          submit={this.triggerDeleteImage}
        />

        <OneClickPasswordModal
          opened={showOneClickPasswordModal}
          onClose={this.closeOneClickPasswordModal}
          onChange={this.triggerChangePassword}
        />

        {isSuperAdmin && (
          <>
            <AdminsModal
              opened={showAdminsModal}
              userEmail={userEmail}
              admins={admins}
              onAdd={this.triggerAddAdmin}
              onRemove={this.openRemoveAdminConfirmationModal}
              onReassign={this.openReassignModal}
              onClose={this.closeAdminsModal}
            />

            <ReassignModal
              opened={showReassignModal}
              onReassign={this.openReassignAdminConfirmationModal}
              onClose={this.closeReassignModal}
              admins={admins}
            />

            <ConfirmationModal
              title="Remove Admin"
              message="Are you sure you want to remove this admin?"
              opened={showRemoveAdminConfirmationModal}
              cancel={this.closeRemoveAdminConfirmationModal}
              submit={this.triggerRemoveAdmin}
            />

            <ConfirmationModal
              title="Reassign Super Admin"
              message="Are you sure you want to reassign super admin?"
              opened={showReassignAdminConfirmationModal}
              cancel={this.closeReassignAdminConfirmationModal}
              submit={this.triggerReassignAdmin}
            />
          </>
        )}
      </div>
    );
  }
}

ControlPanel.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isOfficer: PropTypes.bool.isRequired,
  officerCommittees: PropTypes.arrayOf(PropTypes.string).isRequired,
  logout: PropTypes.func.isRequired,
  deleteEvent: PropTypes.func.isRequired,
  deleteImage: PropTypes.func.isRequired,
  removeAdmin: PropTypes.func.isRequired,
  reassignAdmin: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  userEmail: PropTypes.string.isRequired,
  changeOneClickPassword: PropTypes.func.isRequired,
  oneClickUpdated: PropTypes.bool.isRequired,
  oneClickUpdateSuccess: PropTypes.bool.isRequired,
  oneClickError: PropTypes.string.isRequired,
  eventDeleteError: PropTypes.string,
  imageDeleteError: PropTypes.string,
  adminView: PropTypes.bool.isRequired,
  toggleAdminView: PropTypes.func.isRequired,
};

export default ControlPanel;
