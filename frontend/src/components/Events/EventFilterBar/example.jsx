import React from "react";
import EventFilterBar from "./index";

/**
 * Example usage of the EventFilterBar component
 */
export default class EventFilterBarExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      committee: "All Committees",
      timeRange: "All Time"
    };
    
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleCommitteeChange = this.handleCommitteeChange.bind(this);
    this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
  }
  
  handleSearchChange(searchQuery) {
    this.setState({ searchQuery });
    console.log("Search query:", searchQuery);
  }
  
  handleCommitteeChange(committee) {
    this.setState({ committee });
    console.log("Committee selected:", committee);
  }
  
  handleTimeRangeChange(timeRange) {
    this.setState({ timeRange });
    console.log("Time range selected:", timeRange);
  }
  
  render() {
    // Sample data for committees and time ranges
    const committees = ["AI", "Cyber", "Design", "Hack", "ICPC", "Studio", "TeachLA", "W"];
    const timeRanges = ["Today", "This Week", "This Month", "This Quarter", "This Year"];
    
    return (
      <div style={{ padding: "20px" }}>
        <h2>Events</h2>
        
        <EventFilterBar
          committees={committees}
          timeRanges={timeRanges}
          onSearchChange={this.handleSearchChange}
          onCommitteeChange={this.handleCommitteeChange}
          onTimeRangeChange={this.handleTimeRangeChange}
        />
        
        <div style={{ marginTop: "20px" }}>
          <p><strong>Current Filters:</strong></p>
          <ul>
            <li>Search Query: {this.state.searchQuery || "None"}</li>
            <li>Committee: {this.state.committee}</li>
            <li>Time Range: {this.state.timeRange}</li>
          </ul>
        </div>
      </div>
    );
  }
} 