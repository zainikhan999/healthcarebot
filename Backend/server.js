// server.js
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");
dotenv.config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 5000;
app.use(cors()); // Enable CORS for all routes
// Middleware to parse JSON request bodies
app.use(express.json());

// Example route to test the server
app.get("/", (req, res) => {
  res.send("Hello from the Express server!");
});

// Endpoint for handling health questions and responses
app.post("/api/getHealthSummary", async (req, res) => {
  const { prompt } = req.body;

  try {
    // Gemini API request
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Error contacting Gemini API" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
