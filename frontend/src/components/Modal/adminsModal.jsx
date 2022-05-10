import React from "react";
import PropTypes from "prop-types";
import Button from "components/Button";

export default class AdminsModal extends React.Component {
  render() {
    const { admins, userEmail, onAdd, onRemove, onReassign, onClose, opened } = this.props;

    return opened ? (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>Manage Admins</h1>
            <div className="modal-table">
              <table>
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Email</td>
                    <td />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td>
                      <div className="form-elem table-form-elem">
                        <input
                          type="email"
                          name="email"
                          pattern=".+@g.ucla.edu"
                          title="Please provide a g.ucla.edu email address."
                          id="addAdminEmailField"
                          placeholder="example@g.ucla.edu"
                        />
                      </div>
                    </td>
                    <td className="center">
                      <Button
                        color="blue"
                        text="Add"
                        onClick={() => {
                          const input = document.getElementById("addAdminEmailField");
                          if (input.value !== "" && input.checkValidity()) onAdd(input.value);
                        }}
                      />
                    </td>
                  </tr>
                  {admins.map(admin => (
                    <tr key={admin.email}>
                      <td>{admin.firstName + " " + admin.lastName}</td>
                      <td>{admin.email}</td>
                      <td className="center">
                        {admin.accessType !== "SUPERADMIN" ? (
                          <Button color="red" text="Remove" onClick={() => onRemove(admin.email)} />
                        ) : admin.email === userEmail ? (
                          <Button color="red" text="Reassign" onClick={() => onReassign(admins)} />
                        ) : (
                          <Button color="disabled" text="Reassign" />
                        )}
                      </td>
                    </tr>
                  ))}
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

AdminsModal.propTypes = {
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onReassign: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
