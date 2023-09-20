import React from 'react';
import PropTypes from 'prop-types';
import Config from 'config';
import ResourceCard from './resourceCard';

export default class Resources extends React.Component {
  render() {
    const { error } = this.props;

    if (error) {
      return (
        <div className="resources-wrapper">
          <h1>{error}</h1>
        </div>
      );
    }
    return (
      <div className="resources-wrapper">
        <div className="org-info">
          <img src={Config.organization.logo} alt={Config.organization.name} />
          <h1>{Config.organization.name}</h1>
          <p>{Config.organization.mission}</p>
        </div>
        <div className="divider" />
        <div className="resources">
          {Config.organization.resources.map(resource => (
            <ResourceCard resource={resource} key={resource.type || resource.name} />
          ))}
        </div>
      </div>
    );
  }
}

Resources.propTypes = {
  error: PropTypes.string,
};

Resources.defaultProps = {
  error: null,
};
