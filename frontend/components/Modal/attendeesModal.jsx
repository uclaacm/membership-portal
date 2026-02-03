import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';

export default class AttendeesModal extends React.Component {
  render() {
    const {
      title, onChange, opened, attendees,
    } = this.props;
    return opened ? (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>{title}</h1>
            <br />
            <div className="modal-table">
              <table>
                <thead>
                  <tr>
                    <td />
                    <td>Name</td>
                    <td>Year</td>
                    <td>Major</td>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map(member => (
                    <tr>
                      <td>
                        <img src={member.picture} alt="Attendee" />
                      </td>
                      <td>
                        {member.firstName}
                        {' '}
                        {member.lastName}
                      </td>
                      <td>{member.year}</td>
                      <td>{member.major}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <br />
            <br />
            <div className="button-container">
              <Button text="Close" color="red" onClick={onChange} />
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

AttendeesModal.propTypes = {
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  attendees: PropTypes.arrayOf(PropTypes.shape).isRequired,
  opened: PropTypes.bool.isRequired,
};
