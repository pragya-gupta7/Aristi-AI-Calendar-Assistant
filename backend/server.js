const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const { PublicClientApplication } = require("@azure/msal-node");
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

    if (intentName === "ScheduleEvent") {
      responseText = await handleScheduleEvent(parameters);
    } else if (intentName === "ShowEvents") {
      responseText = await handleShowEvents(parameters);
    } else {
      responseText = "Unknown intent";
    }

    res.json({
      fulfillmentText: responseText,
    });
  } catch (error) {
    console.error("Error during Dialogflow request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function handleScheduleEvent(parameters) {
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
    if (personField) {
      person = personField.stringValue;
    }

    if (!person) {
      person = "";
    }

    const event = {
      subject: "Meeting " + person,
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

    // Simulate scheduling the event
    console.log("event scheduled:", event);

    return `Scheduled an event with ${person} on ${
      dateTime || new Date().toISOString()
    }.`;
  } catch (error) {
    console.error("Error scheduling event:", error);
    throw error;
  }
}

async function handleShowEvents(parameters) {
  try {
    const dateTimeField = parameters["date-time"];

    let dateTime = "";

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

    const Events = [
      {
        subject: "Event 1",
        start: dateTime || new Date().toISOString(),
        end: new Date(
          new Date(dateTime || new Date()).getTime() + 30 * 60000
        ).toISOString(),
      },
    ];

    console.log("Events:", Events);

    if (Events.length === 0) {
      return `No events found on ${dateTime || new Date().toISOString()}.`;
    }

    return `Found ${Events.length} event(s) on ${
      dateTime || new Date().toISOString()
    }.`;
  } catch (error) {
    console.error("Error showing events:", error);
    throw error;
  }
}

async function getAuthenticatedClient() {
  try {
    const msalConfig = {
      auth: {
        clientId: "329b87c4-36c5-4605-ad16-0ce2bfa65021",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "http://localhost:5000/redirect", // Ensure this is configured correctly
      },
    };

    const pca = new PublicClientApplication(msalConfig);

    const account = await getAccount(pca);
    if (!account) {
      throw new Error("User account not found");
    }

    const silentRequest = {
      account: account,
      scopes: ["https://graph.microsoft.com/.default"],
    };

    const authResponse = await pca.acquireTokenSilent(silentRequest);

    const client = Client.init({
      authProvider: (done) => {
        done(null, authResponse.accessToken);
      },
    });

    return client;
  } catch (error) {
    console.error("Error in getAuthenticatedClient:", error);
    throw error;
  }
}

async function getAccount(pca) {
  // Logic to get the account, could be fetching from session or re-authenticating
  const accounts = await pca.getTokenCache().getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
