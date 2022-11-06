// constants
const symbolsAndValues = [
  { symbol: "cherry", value: 10 },
  { symbol: "lemon", value: 20 },
  { symbol: "orange", value: 30 },
  { symbol: "watermelon", value: 40 },
];
const rollingCost = 1;

// rolling functions
const getRandomArrayElement = (array) =>
  Array.isArray(array) && array[Math.floor(Math.random() * array.length)];

const getRandomisedArray = (array, numberOfSymbolsToReturn = 3) => {
  const randomSymbols = new Array(numberOfSymbolsToReturn)
    .fill(null)
    .map(() => getRandomArrayElement(array));
  return randomSymbols;
};

const isWinningRoll = (array) =>
  Array.isArray(array) &&
  array.every((value) => value.symbol === array[0].symbol);

const getReward = (array) => {
  if (array && isWinningRoll(array)) return array[0].value;
  else return 0;
};

const getRollResults = (credits, symbolsRolled, rerollChance = 0) => {
  const win = isWinningRoll(symbolsRolled);
  if (win && Math.random() < rerollChance / 100) {
    const newSymbolsRolled = getRandomisedArray(symbolsAndValues);
    const creditsResult = credits - rollingCost + getReward(newSymbolsRolled);
    const winOnReroll = isWinningRoll(newSymbolsRolled);
    return {
      creditsResult,
      symbolsRolled: newSymbolsRolled,
      win: winOnReroll,
      msg: winOnReroll
        ? `Congratulations you won ${getReward(newSymbolsRolled)} credits!`
        : "better luck next time.",
    };
  } else if (win) {
    return {
      creditsResult: credits - rollingCost + getReward(symbolsRolled),
      symbolsRolled,
      win,
      msg: `Congratulations you won ${getReward(symbolsRolled)} credits!`,
    };
  } else {
    return {
      creditsResult: credits - rollingCost,
      symbolsRolled,
      win,
      msg: "better luck next time.",
    };
  }
};

module.exports = { symbolsAndValues, getRandomisedArray, getRollResults };
