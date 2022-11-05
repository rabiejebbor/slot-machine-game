const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
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

// require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5001;

// mongoose
//     .connect(process.env.ATLAS_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,

//     })
//     .then(() => console.log("db Connected"));

// rolling functions
const symbolsAndValues = [
  { symbol: "cherry", value: 10 },
  { symbol: "lemon", value: 20 },
  { symbol: "orange", value: 30 },
  { symbol: "watermelon", value: 40 },
];
const rollingCost = 1;

const getRandomSymbolsArray = (numberOfSymbolsToReturn = 3) => {
  // const symbols = ["cherry", "lemon", "orange", "watermelon"];
  const randomSymbol = () =>
    symbolsAndValues[Math.floor(Math.random() * symbolsAndValues.length)];

  const randomSymbols = new Array(numberOfSymbolsToReturn)
    .fill(null)
    .map(() => randomSymbol());
  console.log("randomSymbols: ", randomSymbols);
  return randomSymbols;
};

const isWinningRoll = (array) =>
  array.every((value) => value.symbol === array[0].symbol);
const reward = (array) => {
  if (array && isWinningRoll(array)) return array[0].value;
  else return 0;
};
const getCreditsResultByChance = (credits, symbolsRolled, chance = 0) => {
  if (isWinningRoll(symbolsRolled) && Math.random() < chance / 100) {
    const newSymbolsRolled = getRandomSymbolsArray();
    const creditsResult = credits - rollingCost + reward(newSymbolsRolled);
    return {
      creditsResult,
      symbolsRolled: newSymbolsRolled,
      msg: isWinningRoll(newSymbolsRolled)
        ? `Congratulations you won ${reward(newSymbolsRolled)} credits!`
        : "better luck next time.",
    };
  } else if (isWinningRoll(symbolsRolled)) {
    return {
      creditsResult: credits - rollingCost + reward(symbolsRolled),
      symbolsRolled,
      msg: `Congratulations you won ${reward(symbolsRolled)} credits!`,
    };
  } else {
    return {
      creditsResult: credits - rollingCost,
      symbolsRolled,
      msg: "better luck next time.",
    };
  }
};

app.get("/", function (req, res, next) {
  const { sessionID, session } = req;
  session.credits = 10;

  res.status(200).json({ sessionID, session });
});

app.post("/leverpull", function (req, res, next) {
  const { sessionID, session } = req;
  const credits = typeof session.credits == "number" ? session.credits : 10;
  const symbolsRolled = getRandomSymbolsArray();
  let result;

  if (credits >= 1 && credits < 40) {
    // rolls are truly random
    result = getCreditsResultByChance(credits, symbolsRolled);
  } else if (credits >= 40 && credits <= 60) {
    // For each winning roll, before communicating back to client, the server does one 30% chance roll which decides if server will re-roll the that round
    result = getCreditsResultByChance(credits, symbolsRolled, 30);
  } else if (credits > 60) {
    // If user has above 60 credits, the server acts the same, but in this case the chance of re-rolling the round increases to 60%.
    result = getCreditsResultByChance(credits, symbolsRolled, 60);
  } else if (credits < 1) {
    return res.status(200).json({
      sessionID,
      symbolsRolled: session.symbolsRolled,
      credits: session.credits,
      msg: "not enough credits to pull the lever",
    });
  }

  session.credits = result?.creditsResult;
  session.symbolsRolled = result?.symbolsRolled;
  session.msg = result?.msg;
  res.status(200).json({
    sessionID,
    symbolsRolled: session.symbolsRolled,
    credits: session.credits,
    msg: session.msg,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
