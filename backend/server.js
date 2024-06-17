const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { Client } = require("@microsoft/microsoft-graph-client");
const dialogflow = require("@google-cloud/dialogflow");
require("isomorphic-fetch");

const app = express();
const PORT = 5000;

const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
  ca: fs.readFileSync("root.crt"),
};

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Setup Dialogflow client
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: "dialogflow-credentials.json",
});

app.post("/dialogflow/webhook", async (req, res) => {
  console.log("Received request body:", req.body);

  try {
    const sessionId = req.body.sessionId || uuidv4();
    const sessionPath = sessionClient.projectAgentSessionPath(
      "kapila-tnfh",
      sessionId
    );
    const queryInput = {
      text: {
        text: req.body.queryInput.text.text,
        languageCode: "en-US",
      },
    };

    const request = {
      session: sessionPath,
      queryInput: queryInput,
    };

    // Send request to Dialogflow
    const [response] = await sessionClient.detectIntent(request);
    console.log("Dialogflow response:", JSON.stringify(response, null, 2));

    const intentName = response.queryResult.intent.displayName;
    const parameters = response.queryResult.parameters.fields;

    console.log("Intent:", intentName);
    console.log("Parameters:", JSON.stringify(parameters, null, 2));

    let responseText = "";
    const accessToken = req.headers.authorization.split(" ")[1];

    if (intentName === "ScheduleEvent") {
      responseText = await handleScheduleEvent(parameters, accessToken);
    } else if (intentName === "ShowEvents") {
      responseText = await handleShowEvents(parameters, accessToken);
    } else {
      responseText = JSON.stringify({ message: "Unknown intent" });
    }

    res.json({
      fulfillmentText: responseText,
    });
  } catch (error) {
    console.error("Error during Dialogflow request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function handleScheduleEvent(parameters, accessToken) {
  try {
    const dateTimeField = parameters["date-time"];
    const personField = parameters["person"];

    let dateTime = "";
    let person = "";

    // Check if dateTimeField and its properties exist
    if (
      dateTimeField &&
      dateTimeField.listValue &&
      dateTimeField.listValue.values &&
      dateTimeField.listValue.values.length > 0 &&
      dateTimeField.listValue.values[0].structValue &&
      dateTimeField.listValue.values[0].structValue.fields &&
      dateTimeField.listValue.values[0].structValue.fields.date_time
    ) {
      dateTime =
        dateTimeField.listValue.values[0].structValue.fields.date_time
          .stringValue;
    }

    // Check if personField exists
    if (
      personField &&
      personField.structValue &&
      personField.structValue.fields &&
      personField.structValue.fields.name &&
      personField.structValue.fields.name.stringValue
    ) {
      person = personField.structValue.fields.name.stringValue;
    }

    if (!person) {
      person = "";
    }

    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const event = {
      subject: "Meeting with " + person,
      start: {
        dateTime: dateTime || new Date().toISOString(),
        timeZone: "UTC+5:30",
      },
      end: {
        dateTime: new Date(
          new Date(dateTime || new Date()).getTime() + 30 * 60000
        ).toISOString(), // Example end time, 30 minutes later
        timeZone: "UTC+5:30",
      },
    };

    const response = await client.api("/me/events").post(event);

    // Simulate scheduling the event
    console.log("Event scheduled:", response);

    return JSON.stringify({
      message: `Scheduled an event with ${person} on ${
        dateTime || new Date().toISOString()
      }.`,
    });
  } catch (error) {
    console.error("Error scheduling event:", error);
    throw error;
  }
}

async function handleShowEvents(parameters, accessToken) {
  try {
    const dateTimeField = parameters["date-time"];
    let dateTime = "";
    if (
      dateTimeField &&
      dateTimeField.listValue &&
      dateTimeField.listValue.values &&
      dateTimeField.listValue.values.length > 0 &&
      dateTimeField.listValue.values[0].structValue &&
      dateTimeField.listValue.values[0].structValue.fields &&
      dateTimeField.listValue.values[0].structValue.fields.date_time
    ) {
      dateTime =
        dateTimeField.listValue.values[0].structValue.fields.date_time
          .stringValue;
    }

    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const startTime = dateTime || new Date().toISOString();
    const endTime = new Date(
      new Date(startTime).getTime() + 24 * 60 * 60000
    ).toISOString();

    console.log("Fetching events from:", startTime, "to", endTime);

    const events = await client
      .api("/me/calendarview")
      .query({
        startDateTime: startTime,
        endDateTime: endTime,
      })
      .get();

    console.log("Events:", events);

    if (events.value.length === 0) {
      return `No events found on ${dateTime || new Date().toISOString()}.`;
    }

    // Return event details
    const eventDetails = events.value
      .map((event) => {
        return `Event: ${event.subject};`;
      })
      .join("\n\n");

    return `Found ${events.value.length} event(s):\n\n${eventDetails}`;
  } catch (error) {
    console.error("Error showing events:", error);
    throw error;
  }
}

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
