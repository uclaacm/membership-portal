import React from "react";
import PropTypes from "prop-types";
import Button from "components/Button";

export default class ReassignModal extends React.Component {
  render() {
    const { onReassign, onClose, opened, admins } = this.props;

    return opened ? (
      <div className="modal-wrapper">
        <div className="small-input-modal-container">
          <div className="padding">
            <h1>Reassign Super Admin</h1>
            <div className="form-elem">
              <input
                type="email"
                name="email"
                pattern=".+@g.ucla.edu"
                title="Please provide a g.ucla.edu email address."
                id="reassignAdminEmailField"
                placeholder="example@g.ucla.edu"
              />
            </div>
            <Button
              color="red"
              text="Reassign"
              onClick={() => {
                const input = document.getElementById("reassignAdminEmailField");
                if (
                  input.value !== "" &&
                  input.checkValidity() &&
                  admins.map(({ email }) => email).includes(input.value)
                )
                  onReassign(input.value);
              }}
            />
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

ReassignModal.propTypes = {
  onReassign: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
