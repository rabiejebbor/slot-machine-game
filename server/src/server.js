const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const slotMachine = require("./routes/slotMachine");
const store = new session.MemoryStore();
const app = express();

const sessionOptions = {
  secret: "gambling",
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

// require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5001;

// mongoose
//     .connect(process.env.ATLAS_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,

//     })
//     .then(() => console.log("db Connected"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
