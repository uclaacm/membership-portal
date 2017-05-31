import React from 'react'
import Button from 'components/Button/index'

export default class DetailsCard extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        if (this.props.onChange)
            this.props.onChange(e.target.name, e.target.value);
    }

    render () {
        // var buttonStyle = '';
        // if(this.props.type === "confirm-details") {
        //     buttonStyle = "green";
        // }
        return(
            <div className={"card details-card " + (this.props.profileValid() ? "confirm-details" : "")}>
                <div className="inner">
                    <form onSubmit={this.props.onSubmit} autocomplete="off">
                        <p className="header">Account Details</p>

                        <div className="email">
                            <p className="text">School Email <span className="info">(@ucla.edu)</span></p>
                            <input className="input-large" name="email" value={this.props.profile.email} onChange={this.handleChange}></input>
                        </div>
                        <div className="password">
                            <p className="text">Password <span className="info">(at least 8 characters)</span></p>
                            <input type="password" className="input-large" name="password" onChange={this.handleChange}></input>
                        </div>
                        <div className="align">
                            <p className="text">Major <span className="info">(full name of major)</span></p>
                            <input className="input-major" name="major" onChange={this.handleChange}></input>
                        </div>
                        <div className="align">
                            <p className="text">Year <span className="info">(choose one)</span></p>
                            <select className="input-year" name="year" onChange={this.handleChange}>
                                <option value={0}>--</option>
                                <option value={1}>Freshman</option>
                                <option value={2}>Sophomore</option>
                                <option value={3}>Junior</option>
                                <option value={4}>Senior</option>
                                <option value={5}>Post-senior</option>
                            </select>
                        </div>
                        <Button className="btn" style={this.props.profileValid() ? "green" : "disabled"} text="Finish" onClick={this.props.onSubmit}/>
                    </form>
                </div>
            </div>
        );
    }
}