const express = require("express");
const serverless = require("serverless-http");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Apply CORS correctly
app.use(
  cors({
    origin: "https://healthcarebot-gys1.vercel.app", // your frontend domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json());

app.post("/", async (req, res) => {
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

module.exports = app;
module.exports.handler = serverless(app);
