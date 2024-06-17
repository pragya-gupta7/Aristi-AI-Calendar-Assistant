import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./styles/theme";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PublicClientApplication, EventType } from "@azure/msal-browser";

const pca = new PublicClientApplication({
  auth: {
    clientId: "329b87c4-36c5-4605-ad16-0ce2bfa65021",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:3000/dashboard",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPII) => {
        console.log(message);
      },
      logLevel: "Info",
    },
  },
});

pca.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    console.log(event);
    pca.setActiveAccount(event.payload.account);
    pca
      .acquireTokenSilent({
        account: event.payload.account,
        scopes: ["https://graph.microsoft.com/.default"],
      })
      .then((response) => {
        // Store access token in localStorage
        localStorage.setItem("accessToken", response.accessToken);
      })
      .catch((error) => {
        console.error("Failed to acquire access token:", error);
      });
  }
  //localStorage.setItem("accessToken", event.payload.accessToken);
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App msalInstance={pca} />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
