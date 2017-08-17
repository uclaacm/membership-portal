import React from 'react';

export default class ResourceCard extends React.Component {
	render() {
		const { type, title, subtitle, link, description } = this.props.resource;
		const backgroundImage = "url('/assets/images/resource_types/" + type + ".png')";
		return (
			<a className="no-style" target="_BLANK" href={link}>
				<div className="resource-card">
					<div className="cover" style={{ backgroundImage }}></div>
					<div className="content">
						{ title && <h2>{title}</h2> }
						{ subtitle && <h3>{subtitle}</h3> }
						{ description && <div className="description"><p>{description}</p></div> }
					</div>
				</div>
			</a>
		);
	}
}