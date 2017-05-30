import React from 'react';
import Config from 'config';

export default class ResourceCard extends React.Component {
    render() {
        const { type, title, subtitle, link, description } = this.props.resource;
        const backgroundImage = "url('/assets/images/resource_types/" + type + ".png')";
        return (
            <div className="resource-card">
                <div className="cover" style={{ backgroundImage }}></div>
                <div className="content">
                    { title && <h2>{title}</h2> }
                    { subtitle && <h3>{subtitle}</h3> }
                    { description && <div className="description"><p>{description}</p></div> }
                </div>
            </div>
        );
    }
}