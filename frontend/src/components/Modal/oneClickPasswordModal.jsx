import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';

export default class OneClickPasswordModal extends React.Component {
  constructor() {
    super();
    this.state = {
      passwordResetMessage: '',
    };
  }

  changePasswordResetMessage = (msg) => {
    this.setState({ passwordResetMessage: msg });
  };

  render() {
    const { onChange, onClose, opened } = this.props;
    const { passwordResetMessage } = this.state;

    return opened ? (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>Manage One-Click API</h1>
            <div className="form-elem">
              <input
                type="password"
                name="current-password"
                placeholder="Current password"
                id="passwordResetOldPassword"
                onChange={() => this.changePasswordResetMessage('')}
              />
              <br />
              <br />
              <input
                type="password"
                name="new-password"
                placeholder="New password"
                id="passwordResetNewPassword"
                onChange={() => this.changePasswordResetMessage('')}
              />
              <br />
              <br />
              <input
                type="password"
                name="new-password"
                placeholder="Confirm new password"
                id="passwordResetConfirmNewPassword"
                onChange={() => this.changePasswordResetMessage('')}
              />
            </div>

            <div className="form-elem">
              <div className="passwordResetBar">
                <Button
                  className="control-panel-action-button"
                  color="red"
                  text="Change Password"
                  onClick={() => {
                    const oldPassword = document.getElementById('passwordResetOldPassword').value;
                    const newPassword = document.getElementById('passwordResetNewPassword').value;
                    const confirmNewPassword = document.getElementById('passwordResetConfirmNewPassword').value;
                    if (oldPassword === '' || newPassword === '' || confirmNewPassword === '') {
                      this.changePasswordResetMessage('At least one field is empty.');
                    } else if (newPassword !== confirmNewPassword) {
                      this.changePasswordResetMessage('New password does not match.');
                    } else {
                      onChange(oldPassword, newPassword);
                    }
                  }}
                />
                <div className="passwordResetStatus">{passwordResetMessage}</div>
              </div>
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

OneClickPasswordModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
