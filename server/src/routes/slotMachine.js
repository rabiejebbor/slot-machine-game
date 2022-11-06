const express = require("express");
const router = express.Router();
const {
  symbolsAndValues,
  getRandomisedArray,
  getRollResults,
} = require("../helpers/slotMachine");

const resetSessionRoll = (session) => {
  session.symbolsRolled = [];
  session.win = false;
  session.msg = "";
};

router.get("/", function (req, res, next) {
  const { sessionID, session } = req;
  session.credits = 10;
  resetSessionRoll(session);

  res.status(200).json({ sessionID, session });
});

router.post("/leverpull", function (req, res, next) {
  const { sessionID, session } = req;
  const credits = typeof session.credits == "number" ? session.credits : 10;
  const symbolsRolled = getRandomisedArray(symbolsAndValues);
  let result;
  resetSessionRoll(session);

  if (credits >= 1 && credits < 40) {
    // rolls are truly random
    result = getRollResults(credits, symbolsRolled);
  } else if (credits >= 40 && credits <= 60) {
    // For each winning roll, before communicating back to client, the server does one 30% chance roll which decides if server will re-roll the that round
    result = getRollResults(credits, symbolsRolled, 30);
  } else if (credits > 60) {
    // If user has above 60 credits, the server acts the same, but in this case the chance of re-rolling the round increases to 60%.
    result = getRollResults(credits, symbolsRolled, 60);
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
  session.win = result?.win;
  session.msg = result?.msg;
  res.status(200).json({
    sessionID,
    symbolsRolled: session.symbolsRolled,
    credits: session.credits,
    win: session.win,
    msg: session.msg,
  });
});

module.exports = router;
