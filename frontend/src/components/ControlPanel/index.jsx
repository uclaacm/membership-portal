import React from 'react';
import PropTypes from 'prop-types';

import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import ControlPanel from './controlPanel';

export default class ControlPanelComponent extends React.Component {
  render() {
    const { logout, events, deleteEvent } = this.props;
    return (
      <div className="controlpanel">
        <Topbar />
        <Sidebar />
        <ControlPanel
          logout={logout}
          events={events}
          deleteEvent={deleteEvent}
        />
      </div>
    );
  }
}

ControlPanelComponent.propTypes = {
  logout: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteEvent: PropTypes.func.isRequired,
};
