// create server
const express = require("express");

// make HTTP request
const axios = require("axios");

const cors = require("cors");

// for app variable and chosen port for incoming requests
const app = express();
const port = process.env.PORT || 3005;

// allows cross-origin requests
app.use(
  cors({
    origin: process.env.corsOrigin || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
// defines a route for handling characters GET requests and fetch data from API
app.get("/api/characters", async (req, res) => {
  try {
    const characters = await fetchDataFromAPI();
    res.json(characters);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// defines a route for handling images/thumbnails GET requests
// handled as an arraybuffer instead of string or object
// content-type for displaying images correctly
app.get("/api/thumbnails", async (req, res) => {
  try {
    const { url } = req.query;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"];
    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    res.sendStatus(500);
  }
});

// using axios to fetch character  data from API with specified url
async function fetchDataFromAPI() {
  const response = await axios.get(
    "https://friends.fandom.com/api/v1/Articles/List?expand=1&abstract=500&category=Characters&limit=500"
  );
  return response.data.items;
}

// the server starts listening for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
