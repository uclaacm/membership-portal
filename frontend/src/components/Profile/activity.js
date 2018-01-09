import React from 'react';
import Config from 'config';

const activityTypes = {
	ACCOUNT_CREATE: 'ACCOUNT_CREATE',
	ATTEND_EVENT: 'ATTEND_EVENT',
	LEVEL_UP: 'LEVEL_UP',
	MILESTONE: 'MILESTONE',
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
		case activityTypes.MILESTONE:
			return {
				icon: 'fa-trophy',
				title: 'Quarter complete',
				description: `You finished ${activity.description} with <b>${activity.pointsEarned}</b> points!`,
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
	}
}

export { activityTypes }