import React, { PropTypes } from 'react'
import Sidebar from 'components/Sidebar'
import EventsDashboard from './eventsDashboard'


class Dashboard extends React.Component {
    render () {
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
                            "location": "Sproul Lecture Room"
                        },
                        {
                            "img": "https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/18402016_1608383172535087_1018900285816195814_o.jpg?oh=7a2a342ed781da2dd4af501b5893ae65&oe=5976DF0D", 
                            "org": "ACM", 
                            "time": "6:00pm-7:00pm", 
                            "title": "How to Negotiate an Offer",                   
                            "location": "Boelter 4760"
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
                            "location": "Boelter 4760"
                        }
                    ]
            }
        ];

        return(
            <div className="dashboard">
                <Sidebar/>
                <EventsDashboard events={eventList}/>
            </div>
        );
    }
}

export default Dashboard;
