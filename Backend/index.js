require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Apply CORS correctly
app.use(cors());
app.use(express.json());

app.post("/api/getHealthSummary", async (req, res) => {
  const { prompt } = req.body;

  try {
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
app.get("/", (req, res) => {
  res.send("Hello from the backend!"); // Simple response for testing
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
