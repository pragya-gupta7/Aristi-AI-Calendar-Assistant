import React, { useState } from "react";
import { Button, TextField, Box, Paper, Typography } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");

  const handleTextInput = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (inputText) => {
    const userInput = inputText || text;
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
      }}
    >
      <Paper
        sx={{ p: 4, maxWidth: 600, width: "100%", textAlign: "center" }}
        elevation={3}
      >
        <TextField
          fullWidth
          multiline
          rows={10}
          variant="outlined"
          value={text}
          onChange={handleTextInput}
          placeholder="Type here ..."
          sx={{ mb: 4 }}
        />
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmit(text)}
            sx={{ mx: 1 }}
          >
            Submit
          </Button>
        </Box>
        {response && (
          <Box sx={{ mt: 2, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
            <Typography variant="h6">Response:</Typography>
            <Typography>{response}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
