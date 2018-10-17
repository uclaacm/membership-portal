import React from 'react';
import Button from 'components/Button';
import PropTypes from 'prop-types';

// import TopAttendee from './topAttendee'

// const names = ['Howard', 'Nikhil', 'Carey'];
// const points = [50, 100, 70];


class ControlPanel extends React.Component {
  render() {
    const { logout } = this.props;
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
          <h1>Top Attendees</h1>
          <table className="test-table">
            <tr>
              <th>
                <span>#</span>
              </th>
              <th className="name">
                <span>Name</span>
              </th>
              <th className="name">
                <span>Points</span>
              </th>
            </tr>
            {
              <div>
                <tr>
                  <td>0</td>
                  <td>
                    Hoard
                  </td>
                </tr>
              </div>
            }
          </table>
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
      </div>
    );
  }
}

ControlPanel.propTypes = {
  logout: PropTypes.func.isRequired,
};

export default ControlPanel;
