import React from 'react';
import Config from 'config';

const activityTypes = {
  ACCOUNT_CREATE: 'ACCOUNT_CREATE',
  ATTEND_EVENT: 'ATTEND_EVENT',
  LEVEL_UP: 'LEVEL_UP',
};

const mapActivity = activity => {
  switch (activity.type) {
    case activityTypes.ACCOUNT_CREATE:
      return {
        icon: 'fa-street-view',
        title: 'Account created!',
        description: `Welcome to ${Config.organization.shortName}!`,
      };
    case activityTypes.ATTEND_EVENT:
      return {
        icon: 'fa-calendar',
        title: `Attended <i>${activity.description}</i>`,
        description: `You earned <b>${activity.pointsEarned} points</b>.`,
      };
    case activityTypes.LEVEL_UP:
      return {
        icon: 'fa-star level-up-icon',
        title: 'Leveled Up!',
        description: `${activity.prevLevel.rank} <i class="fa fa-long-arrow-right"></i> ${activity.nextLevel.rank}`,
      };
    default:
      return null;
  }
}

export default class Activities extends React.Component {
  render() {
    const activity = mapActivity(this.props.activity);
    return (
      <div className="activity-item">
        <h3><i className={`fa ${activity.icon}`} aria-hidden="true"></i><span dangerouslySetInnerHTML={{__html: activity.title}}></span></h3>
        <p className="description" dangerouslySetInnerHTML={{__html:activity.description}}></p>
      </div>
    );
    // return (
    //   <div className="activity-wrapper">
    //     <div className="month">
    //       <h2>September <span>2017</span></h2>
    //       <div className="day">
    //         <div className="day-label">4</div>
    //         <div className="activity-item">
    //           <h3><i className="fa fa-calendar" aria-hidden="true"></i>Attended <i>Project A*: Greedy Algorithms</i></h3>
    //           <p className="description">You earned <b>10 points</b>.</p>
    //         </div>
    //       </div>
    //     </div>
    //     <div className="month">
    //       <h2>August <span>2017</span></h2>
    //       <div className="day">
    //         <div className="day-label">16</div>
    //         <div className="activity-item">
    //           <h3><i className="fa fa-star level-up-icon" aria-hidden="true"></i>Leveled Up!</h3>
    //           <p className="description">Newbie I <i className="fa fa-long-arrow-right"></i> <b>Newbie II</b></p>
    //         </div>
    //         <div className="activity-item">
    //           <h3><i className="fa fa-calendar" aria-hidden="true"></i>Attended <i>Intro to Machine Learning</i></h3>
    //           <p className="description">You earned <b>10 points</b>.</p>
    //         </div>
    //       </div>
    //       <div className="day">
    //         <div className="day-label">12</div>
    //         <div className="activity-item">
    //           <h3><i className="fa fa-calendar" aria-hidden="true"></i>Attended <i>Hack on the Hill 2</i></h3>
    //           <p className="description">You earned <b>20 points</b>.</p>
    //         </div>
    //         <div className="activity-item">
    //           <h3><i className="fa fa-street-view" aria-hidden="true"></i>Account created!</h3>
    //           <p className="description">This is a short description</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // )
  }
}

export { activityTypes }