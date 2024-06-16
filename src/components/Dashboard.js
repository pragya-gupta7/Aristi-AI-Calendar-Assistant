import React, { useState } from "react";
import { TextField, Button, Box, Paper, Typography } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");

  const handleTextInput = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async () => {
    const sessionId = uuidv4();
    console.log("User input:", text);

    try {
      const res = await fetch("https://localhost:5000/dialogflow/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: sessionId,
          queryInput: { text: { text, languageCode: "en" } },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      setResponse(data.fulfillmentText);
      setText("");
    } catch (error) {
      console.error("Error:", error);
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
          placeholder="Type here..."
          sx={{ mb: 4 }}
        />
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
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
