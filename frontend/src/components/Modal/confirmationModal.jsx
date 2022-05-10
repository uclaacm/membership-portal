import React from "react";
import PropTypes from "prop-types";
import Button from "components/Button";

export default class ConfirmationModal extends React.Component {
  render() {
    const { title, message, submit, cancel, opened } = this.props;
    return opened ? (
      <div className="modal-wrapper">
        <div className="confirmation-modal-container">
          <div className="padding">
            <h1>{title}</h1>
            <br />
            <p>{message}</p>
            <br />
            <br />
            <div className="button-container">
              <div className="button-padding">
                <Button text="Yes" color="green" onClick={submit} />
              </div>
              <div className="button-padding">
                <Button text="No" color="red" onClick={cancel} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

ConfirmationModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
