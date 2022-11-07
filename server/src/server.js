const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const slotMachine = require("./routes/slotMachine");
const store = new session.MemoryStore();
const app = express();

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: false,
  cookie: {},
  store,
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionOptions.cookie.secure = true;
}

app.use(session(sessionOptions));

app.use(cors());
app.use(express.json());
app.use("/slotmachine", slotMachine);

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
