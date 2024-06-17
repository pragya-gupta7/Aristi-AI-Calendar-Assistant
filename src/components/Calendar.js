import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
const { v4: uuidv4 } = require("uuid");

const localizer = momentLocalizer(moment);

const WeeklyCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await fetch("https://localhost:5000/dialogflow/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            sessionId: uuidv4(),
            queryInput: {
              text: {
                text: "ShowEvents",
                languageCode: "en-US",
              },
            },
          }),
        });

        const data = await res.json();
        if (data.fulfillmentText) {
          const parsedEvents = parseEvents(data.fulfillmentText);
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const parseEvents = (fulfillmentText) => {
    const eventLines = fulfillmentText.split("\n\n");
    const events = eventLines.map((line) => {
      const [subject, start, end] = line
        .split("\n")
        .map((item) => item.split(": ")[1]);
      return {
        title: subject,
        start: new Date(start),
        end: new Date(end),
      };
    });
    return events;
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default WeeklyCalendar;
