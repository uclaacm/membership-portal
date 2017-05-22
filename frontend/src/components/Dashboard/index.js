import React, { PropTypes } from 'react'
import Sidebar from '../Sidebar/sidebar'
import EventsDashboard from './eventsDashboard'


class Dashboard extends React.Component {
    render () {
        console.log(`events: ${this.props.events}`);
        const eventList =
        [
            {
                "date": "Wednesday, April 19th",
                    "events": [
                        {
                            "img": "https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/18402016_1608383172535087_1018900285816195814_o.jpg?oh=7a2a342ed781da2dd4af501b5893ae65&oe=5976DF0D",
                            "org": "ACM Hack",
                            "time": "6:15pm-8:15pm",
                            "title": "Hack Sprint Session 1",
                            "location": "Sproul Lecture Room",
                            "description": "Come to the ACM kickoff meeting. There will be free food!",
                            "attendancePoints": 20

                        },
                        {
                            "img": "https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/18402016_1608383172535087_1018900285816195814_o.jpg?oh=7a2a342ed781da2dd4af501b5893ae65&oe=5976DF0D",
                            "org": "ACM",
                            "time": "6:00pm-7:00pm",
                            "title": "How to Negotiate an Offer",
                            "location": "Boelter 4760",
                            "description": "Your job-hunt should not end when you get all your dream job offers. There is one last step that many people (especially college students) always forget about: negotiation. This is unfortunate because negotiation takes very little work, but can have a very large impact on your compensation. By explaining how to negotiate, we hope to dispel the fear around negotiation and teach you how to maximize your compensation package.",
                            "attendancePoints": 15
                        }
                    ]
            },
            {
                "date": "Thursday, April 20th",
                    "events": [
                        {
                            "img": "https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/18402016_1608383172535087_1018900285816195814_o.jpg?oh=7a2a342ed781da2dd4af501b5893ae65&oe=5976DF0D",
                            "org": "ACM AI",
                            "time": "4:00pm-6:00pm",
                            "title": "Machine Learning with Tensorflow and other stuff more text",
                            "location": "Boelter 4760",
                            "description": "Come learn about Tensorflow and other stuff more text here. It's a beginner friendly workshop, but please come with everything installed beforehand! Prior knowledge in Python is highly recommended but anything will do.",
                            "attendancePoints": 5
                        }
                    ]
            }
        ];

        return(
            <div className="dashboard">
                <Sidebar/>
                <EventsDashboard events={eventList} error={this.props.error}/>
            </div>
        );
    }
}

export default Dashboard;
