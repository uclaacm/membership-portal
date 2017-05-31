import React from 'react';
import Config from 'config';
import ResourceCard from './resourceCard';
import OfficerTile from './officerTile';

export default class Resources extends React.Component {
    render() {
        if (this.props.error)
            return <div className="resources-wrapper"><h1>{this.props.error}</h1></div>;
        return (
            <div className="resources-wrapper">
                <div className="org-info">
                    <img src={Config.organization.logo} />
                    <h1>{Config.organization.name}</h1>
                    <p>{Config.organization.mission}</p>
                </div>
                <div className="divider"></div>
                <div className="officers">
                    { Config.organization.officers.map((officer, i) => <OfficerTile officer={officer} key={i} />) }
                </div>
                <div className="divider"></div>
                <div className="resources">
                    { Config.organization.resources.map((resource, i) => <ResourceCard resource={resource} key={i} />) }
                </div>
            </div>
        );
    }
}