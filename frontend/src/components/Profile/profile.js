import React from 'react';
import Button from 'components/Button';
import EditableSpan from './editableSpan';
import YearSelector from './yearSelector';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.profile;
        this.originalProfile = this.props.profile;
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    handleUpdate(obj) {
        console.log(obj);
        let newObject = { };
        newObject[obj.target] = obj.value;
        this.setState(prev => Object.assign({}, prev, newObject));
    }

    profileUpdated() {
        return this.state.name !== this.originalProfile.name ||
               this.state.year !== this.originalProfile.year ||
               this.state.major !== this.originalProfile.major;
    }

    render() {
        if (this.props.error) {
            return <div className="profile-wrapper"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="profile-wrapper">
                    <form>
                        <div className="form-elem">
                            <p className="SubheaderSecondary">Hello,</p>
                            <EditableSpan target="name" value={this.props.profile.name} onChange={this.handleUpdate} />
                        </div>
                        <div className="form-elem">
                            <p className="SubheaderSecondary">You are a</p>
                            <YearSelector target="year" value={this.props.profile.year} onChange={this.handleUpdate} />
                        </div>
                        <div className="form-elem">
                            <p className="SubheaderSecondary">majoring in</p>
                            <EditableSpan target="major" value={this.props.profile.major} onChange={this.handleUpdate} />
                        </div>
                    </form>
                    <Button className="profile-action-button" style={ this.profileUpdated() ? "blue" : "disabled" } text="Save" />
                    <Button className="profile-action-button" style={ this.profileUpdated() ? "red" : "disabled" } text="Discard" />
                    {/*<Button className="profile-action-button" style="blue small" text="Change Password" />*/}
                </div>
            );
        }
    }
}