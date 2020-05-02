import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import PropTypes from 'prop-types';

import { Action } from 'reducers';
import ControlPanelComponent from 'components/ControlPanel';

class ControlPanel extends React.Component {
  componentWillMount() {
    const { isAdmin, redirectHome } = this.props;
    if (!isAdmin) {
      return redirectHome();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isAdmin) {
      return nextProps.redirectHome();
    }
  }

  render() {
    const { logout, events, deleteEvent } = this.props;
    return (
      <ControlPanelComponent
        logout={logout}
        events={events}
        deleteEvent={deleteEvent}
      />
    );
  }
}

const mapStateToProps = state => ({
  authenticated: state.Auth.get('authenticated'),
  isAdmin: state.Auth.get('isAdmin'),
  events: state.Events.get('events'),
});

const mapDispatchToProps = dispatch => ({
  redirectHome: () => {
    dispatch(replace('/'));
  },
  logout: () => {
    dispatch(Action.LogoutUser());
  },
  deleteEvent: (uuid) => {
    dispatch(Action.DeleteEvent(uuid));
  },
});

ControlPanel.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  redirectHome: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteEvent: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
