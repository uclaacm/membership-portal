import React from "react";
import PropTypes from "prop-types";

export default class EventFilterBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      committee: "All Committees",
      timeRange: "Upcoming"
    };
    
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleCommitteeChange = this.handleCommitteeChange.bind(this);
    this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
  }
  
  handleSearchChange(e) {
    const searchQuery = e.target.value;
    this.setState({ searchQuery });
    
    if (this.props.onSearchChange) {
      this.props.onSearchChange(searchQuery);
    }
  }
  
  handleCommitteeChange(e) {
    const committee = e.target.value;
    this.setState({ committee });
    
    if (this.props.onCommitteeChange) {
      this.props.onCommitteeChange(committee);
    }
  }
  
  handleTimeRangeChange(e) {
    const timeRange = e.target.value;
    this.setState({ timeRange });
    
    if (this.props.onTimeRangeChange) {
      this.props.onTimeRangeChange(timeRange);
    }
  }
  
  render() {
    const { committees = [], timeRanges = [] } = this.props;
    const { searchQuery, committee, timeRange } = this.state;
    
    return (
      <div className="event-filter-bar">
        <div className="search-container">
          <i className="fa fa-search search-icon" aria-hidden="true"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={this.handleSearchChange}
          />
        </div>
        
        <div className="filter-container">
          <div className="select-wrapper">
            <select
              value={committee}
              onChange={this.handleCommitteeChange}
              className="filter-select"
            >
              <option value="All Committees">All Committees</option>
              {committees.map((committeeName, index) => (
                <option key={index} value={committeeName}>
                  {committeeName}
                </option>
              ))}
            </select>
            <i className="fa fa-chevron-down select-icon" aria-hidden="true"></i>
          </div>
          
          <div className="select-wrapper">
            <select
              value={timeRange}
              onChange={this.handleTimeRangeChange}
              className="filter-select"
            >
              <option value="Upcoming">Upcoming</option>
              {timeRanges.map((range, index) => (
                <option key={index} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <i className="fa fa-chevron-down select-icon" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    );
  }
}

EventFilterBar.propTypes = {
  committees: PropTypes.arrayOf(PropTypes.string),
  timeRanges: PropTypes.arrayOf(PropTypes.string),
  onSearchChange: PropTypes.func,
  onCommitteeChange: PropTypes.func,
  onTimeRangeChange: PropTypes.func
};

EventFilterBar.defaultProps = {
  committees: [],
  timeRanges: [],
  onSearchChange: () => {},
  onCommitteeChange: () => {},
  onTimeRangeChange: () => {}
}; 