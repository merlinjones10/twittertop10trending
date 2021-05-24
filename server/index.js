const http = require("http");
const path = require("path");
const express = require("express");
const socketIo = require("socket.io");
const needle = require("needle");
const config = require("dotenv").config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const trendURL = "https://api.twitter.com/1.1/trends/place.json?id=23424975";

async function getRequest(socket) {
  const params = {
    ids: "1278747501642657792,1255542774432063488", // Edit Tweet IDs to look up
    "tweet.fields": "lang,author_id", // Edit optional query parameters here
    "user.fields": "created_at", // Edit optional query parameters here
  };
  const res = await needle("get", trendURL, {
    headers: {
      "User-Agent": "v2TweetLookupJS",
      authorization: `Bearer ${TOKEN}`,
    },
  });
  const data = res.body;
  if (res.body) {
    return res.body;
  } else {
    throw new Error("Unsuccessful request");
  }
}

async function getTrends(socket) {
  try {
    // Make request
    const response = await getRequest();
    // let data = await response.json();
    // console.log(response)
    // console.log(response[0].trends[0])
    //
    socket.emit("tweet", response);
    console.dir(response, {
      depth: null,
    });
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
  // process.exit(); // stops the server
}

// SERVER SIDE socket.io

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", () => {
  console.log("client connected");
  getTrends(io);
});

///// //// //// //// //// ///
server.listen(3000, () => {
  console.log("listening on *:3000");
});
