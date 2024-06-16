const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");
const fs = require("fs");

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

app.post("/dialogflow/webhook", (req, res) => {
  console.log("Received request body:", req.body); // Log the request body

  const queryResult = req.body.queryResult;

  if (queryResult) {
    const intentName = queryResult.intent.displayName;

    if (intentName === "ScheduleEvent") {
      handleScheduleEvent(req, res);
    } else if (intentName === "ShowEvents") {
      handleShowEvents(req, res);
    } else {
      res.status(400).json({ error: "Unknown intent" });
    }
  } else {
    res.status(400).json({ error: "Invalid request payload" });
  }
});

function handleScheduleEvent(req, res) {
  const parameters = req.body.queryResult.parameters;
  const dateTime = parameters["date-time"];
  const timePeriod = parameters["time-period"];
  const person = parameters["person"];

  const responseText = `Scheduled an event with ${person} on ${dateTime} during ${timePeriod}.`;

  res.json({
    fulfillmentText: responseText,
  });
}

function handleShowEvents(req, res) {
  const parameters = req.body.queryResult.parameters;
  const dateTime = parameters["date-time"];
  const timePeriod = parameters["time-period"];

  const responseText = `Showing events on ${dateTime} during ${timePeriod}.`;

  res.json({
    fulfillmentText: responseText,
  });
}

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
