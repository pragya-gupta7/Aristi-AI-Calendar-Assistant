import React, { useState } from "react";
import { Button, TextField, Box, Paper, Typography, Grid } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import WeeklyCalendar from "./Calendar";

const Dashboard = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");

  const handleTextInput = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();  // Prevent form submission from reloading the page
    const userInput = text;
    const sessionId = uuidv4();
    console.log("User input:", userInput);
    const accessToken = localStorage.getItem("accessToken");

    try {
      const res = await fetch("https://localhost:5000/dialogflow/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sessionId: sessionId,
          queryInput: {
            text: {
              text: userInput,
              languageCode: "en-US",
            },
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      console.log("Server response:", data);
      setResponse(data.fulfillmentText || data.error);
      setText("");
    } catch (error) {
      console.error("Error:", error);
      setResponse(error.message);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={text}
                onChange={handleTextInput}
                placeholder="Tell me how can I help you?"
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Send
              </Button>
            </form>
            {response && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Response:</Typography>
                <Typography variant="body1">{response}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <WeeklyCalendar />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
