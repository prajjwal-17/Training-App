const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const db = require("./db"); // Our database module

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust to your frontend URL
    methods: ["GET", "POST"],
  },
});

// In-memory waiting queue for duel search
let waitingQueue = [];

// In-memory store for active duels
let duels = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("find_duel", () => {
    console.log(`User ${socket.id} is searching for a duel...`);
    if (!waitingQueue.includes(socket.id)) {
      waitingQueue.push(socket.id);
      socket.emit("searching", { message: "Searching for duel..." });
    }
    if (waitingQueue.length >= 2) {
      const player1 = waitingQueue.shift();
      const player2 = waitingQueue.shift();
      const duelId = uuidv4();
      duels[duelId] = {
        duelId,
        player1,
        player2,
        player1Ready: false,
        player2Ready: false,
        rep1: 0,
        rep2: 0,
      };
      io.to(player1).emit("duel_found", { duelId, opponent: player2 });
      io.to(player2).emit("duel_found", { duelId, opponent: player1 });
      startDuelCountdown(duelId);
    }
  });

  socket.on("start_duel", ({ duelId }) => {
    if (duels[duelId]) {
      if (socket.id === duels[duelId].player1) {
        duels[duelId].player1Ready = true;
      } else if (socket.id === duels[duelId].player2) {
        duels[duelId].player2Ready = true;
      }
      console.log(`Player ${socket.id} is ready for duel ${duelId}`);
      if (duels[duelId].player1Ready && duels[duelId].player2Ready) {
        clearTimeout(duels[duelId].startTimeout);
        io.to(duels[duelId].player1).emit("duel_started", { duelId });
        io.to(duels[duelId].player2).emit("duel_started", { duelId });
        startChallengeTimer(duelId);
      }
    }
  });

  socket.on("update_reps", ({ duelId, reps }) => {
    if (duels[duelId]) {
      if (socket.id === duels[duelId].player1) {
        duels[duelId].rep1 = reps;
      } else if (socket.id === duels[duelId].player2) {
        duels[duelId].rep2 = reps;
      }
      io.to(duels[duelId].player1).emit("reps_update", {
        rep1: duels[duelId].rep1,
        rep2: duels[duelId].rep2,
      });
      io.to(duels[duelId].player2).emit("reps_update", {
        rep1: duels[duelId].rep1,
        rep2: duels[duelId].rep2,
      });
    }
  });

  socket.on("end_duel", ({ duelId }) => {
    concludeDuel(duelId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    waitingQueue = waitingQueue.filter((id) => id !== socket.id);
    for (const duelId in duels) {
      if (duels[duelId].player1 === socket.id || duels[duelId].player2 === socket.id) {
        const other = duels[duelId].player1 === socket.id ? duels[duelId].player2 : duels[duelId].player1;
        io.to(other).emit("duel_cancelled", {
          message: "Opponent left; duel cancelled!",
        });
        delete duels[duelId];
      }
    }
  });
});

function startDuelCountdown(duelId) {
  if (duels[duelId]) {
    duels[duelId].startTimeout = setTimeout(() => {
      if (!duels[duelId].player1Ready || !duels[duelId].player2Ready) {
        if (!duels[duelId].player1Ready) {
          io.to(duels[duelId].player1).emit("disqualified", { message: "You did not start in time." });
          io.to(duels[duelId].player2).emit("duel_result", { result: "You win! Opponent did not start in time." });
        } else if (!duels[duelId].player2Ready) {
          io.to(duels[duelId].player2).emit("disqualified", { message: "You did not start in time." });
          io.to(duels[duelId].player1).emit("duel_result", { result: "You win! Opponent did not start in time." });
        }
        delete duels[duelId];
      }
    }, 30000);
  }
}

function startChallengeTimer(duelId) {
  if (duels[duelId]) {
    duels[duelId].challengeTimeout = setTimeout(() => {
      concludeDuel(duelId);
    }, 10000);
  }
}

async function concludeDuel(duelId) {
  if (duels[duelId]) {
    const { rep1, rep2, player1, player2 } = duels[duelId];
    let result = rep1 > rep2 ? "player1 wins" : rep2 > rep1 ? "player2 wins" : "draw";

    io.to(player1).emit("duel_result", { result, rep1, rep2 });
    io.to(player2).emit("duel_result", { result, rep1, rep2 });

    try {
      await db.query(
        `INSERT INTO duels (duel_id, player1_id, player2_id, player1_reps, player2_reps, result) VALUES ($1, $2, $3, $4, $5, $6)`,
        [duelId, player1, player2, rep1, rep2, result]
      );
      console.log(`Duel ${duelId} saved to database.`);
    } catch (error) {
      console.error("Error saving duel to database:", error);
    }
    delete duels[duelId];
  }
}

server.listen(5000, () => console.log("Server running on port 5000"));
