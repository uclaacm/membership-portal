import React from "react";
import Utils from "@/lib/utils";
import TopUser from "./topUser";
import LeaderboardPicture from "./leaderboardPicture";
import LeaderboardModal from "@/components/Modal/leaderboardModal";
import "./style.scss";

const INIT_ITEMS = 200;
const SCROLL_INCR = 100;

class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maxItems: INIT_ITEMS,
      openedModal: false,
      modalFirstName: "",
      modalLastName: "",
      modalPicture: "",
      modalMajor: "",
      modalYear: "",
    };
    this.rankForUser = this.rankForUser.bind(this);
  }
  componentDidMount() {
    document.addEventListener("scroll", this.trackScrolling);
  }
  componentWillUnmount() {
    document.removeEventListener("scroll", this.trackScrolling);
  }
  rankForUser(user) {
    return Utils.getLevel(user.points).currLevel.rank;
  }
  reachedBottom() {
    const leaderboardWrapper = document.getElementsByClassName("leaderboard-table")[0];
    return leaderboardWrapper.getBoundingClientRect().bottom <= window.innerHeight;
  }
  loadMoreUsers = () => {
    this.setState(prev => ({
      maxItems: Math.min(prev.maxItems + SCROLL_INCR, this.props.leaderboard.length),
    }));
  };
  trackScrolling = () => {
    if (this.reachedBottom() && this.state.maxItems < this.props.leaderboard.length) {
      this.loadMoreUsers();
    }
  };
  updateModalInfo = (firstName, lastName, picture, major, year) => {
    this.setState({
      modalFirstName: firstName,
      modalLastName: lastName,
      modalPicture: picture,
      modalMajor: major,
      modalYear: year,
    });
    this.modalToggle();
  };
  modalToggle = () => {
    this.setState({
      openedModal: !this.state.openedModal,
    });
  };

  render() {
    if (!this.props.leaderboard || !this.props.leaderboard.length || this.props.leaderboard.length < 3) return null;
    if (this.props.error) {
      return (
        <div className="leaderboard-wrapper">
          <h1>{this.props.error}</h1>
        </div>
      );
    } else {
      return (
        <div className="leaderboard-wrapper">
          <LeaderboardModal
            firstName={this.state.modalFirstName}
            lastName={this.state.modalLastName}
            picture={this.state.modalPicture}
            major={this.state.modalMajor}
            year={this.state.modalYear}
            opened={this.state.openedModal}
            onChange={this.modalToggle}
          />
          <div className="top-users">
            <TopUser user={this.props.leaderboard[1]} place={2} onChange={this.updateModalInfo} />
            <TopUser user={this.props.leaderboard[0]} place={1} onChange={this.updateModalInfo} />
            <TopUser user={this.props.leaderboard[2]} place={3} onChange={this.updateModalInfo} />
          </div>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <td>#</td>
                <td className="name">
                  <div>
                    <img />
                    <span>Name</span>
                  </div>
                </td>
                <td className="rank">Rank</td>
                <td className="points">Points</td>
              </tr>
            </thead>
            <tbody>
              {this.props.leaderboard.slice(3, 3 + this.state.maxItems).map((user, i) => (
                <tr className={user.uuid === this.props.user?.uuid ? "current-user" : ""} key={user.uuid}>
                  <td>{i + 4}</td>
                  <td className="name">
                    <div className="inner-name">
                      <LeaderboardPicture
                        picture={user.picture}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        major={user.major}
                        year={user.year}
                        onChange={this.updateModalInfo}
                      />
                      <span
                        onClick={this.updateModalInfo.bind(
                          this,
                          user.firstName,
                          user.lastName,
                          user.picture,
                          user.major,
                          user.year
                        )}
                      >
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="rank">{this.rankForUser(user)}</td>
                  <td className="points">{user.points} points</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

export default Leaderboard;
