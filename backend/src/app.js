const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to CardioDerma API!", status: "running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", project: "CardioDerma" });
});

app.use("/api", routes);

// Toujours en dernier
app.use(notFound);
app.use(errorHandler);

module.exports = app;