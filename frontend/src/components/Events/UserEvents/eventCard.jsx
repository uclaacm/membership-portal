import React, {useState, useEffect} from "react";
import styles from './styles.scss';

/* 
      attendancePoints: "",
      committee: "",
      cover: "",
      description: "",
      endDate: "", // endTime
      eventLink: "",
      location: "",
      startDate: "", // startTime
      title: "",
      startTime: "",
*/
const EventCard = ({ event }) => {

    return (
        <>
            <div className="event-container">
                <div className="image-container">
                    <div className="cover" style={{backgroundImage: `url(${event.cover})`}}> </div>
                    <div className="pill-shape points-container">{event.attendancePoints} PTS</div>
                </div>

                <div className="text-container">
                    <p className="event-title">{event.title}</p>
                    <p className="text">{event.startDate?.format("MMMM D, YYYY")}, {event.startDate?.format("h:mm a")}&mdash;{event.endDate?.format("h:mm a")}</p>
                    <p className="text">{event.location}</p>
                    <p className="text">{event.committee}</p>
                    <div className="pill-shape rsvp">RSVP</div>
                </div>
            </div>
        </>
    );
}

export default EventCard;
