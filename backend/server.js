
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CardioDerma API!",
    status: "running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    project: "CardioDerma",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`CardioDerma API running on port ${PORT}`);
});
