import React from 'react';

export default class OfficerTile extends React.Component {
    render() {
        const { name, position, email } = this.props.officer;
        const backgroundImage = this.props.officer.picture;
        return (
            <div className="officer-tile">
                <img src={backgroundImage} />
                <div className="content">
                    { name && <span className="name">{name}</span> }
                    { position && <span className="position">{position}</span> }
                    { email && <span className="email">{email}</span> }
                </div>
            </div>
        );
    }
}