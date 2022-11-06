import React, { useState, useEffect } from "react";
import "./App.css";

const symbols = [
  { symbol: "cherry", spinning: false },
  { symbol: "lemon", spinning: false },
  { symbol: "orange", spinning: false },
  { symbol: "watermelon", spinning: false },
];

const getRandomArrayElement = (array) =>
  Array.isArray(array) && array[Math.floor(Math.random() * array.length)];

const getRandomisedArray = (array, numberOfSymbolsToReturn = 3) => {
  const randomSymbols = new Array(numberOfSymbolsToReturn)
    .fill(null)
    .map(() => getRandomArrayElement(array));
  return randomSymbols;
};
const getCookieValue = (name) =>
  document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "";

function App() {
  const [credits, setCredits] = useState(0);
  const [account, setAccount] = useState(0);
  const [msg, setMsg] = useState("");
  const [cashOutButtonStyle, setCashOutButtonStyle] = useState({
    position: "relative",
  });
  const [symbolsRolled, setSymbolsRolled] = useState(
    getRandomisedArray(symbols)
  );
  const [clickable, setClickable] = useState(true);

  const onRoll = async () => {
    const req = await fetch(`/slotmachine/leverpull`, { method: "POST" });
    const result = await req.json();
    const { credits, symbolsRolled: newSymbolsRolled, win, msg } = result;
    const formattedSymbolsArray = newSymbolsRolled.map((symbol) => {
      return { symbol, spinning: true };
    });
    setCredits(credits);
    setSymbolsRolled(formattedSymbolsArray);
    setMsg(msg);
    //After receiving response from server, the first sign should spin for 1 second more and then display the result, then display the second sign at 2 seconds, then the third sign at 3 seconds.

    for (let i = 0; i < formattedSymbolsArray.length; i++) {
      setTimeout(() => {
        setSymbolsRolled((oldArray) => [
          ...oldArray.slice(0, i),
          { ...oldArray[i], spinning: false },
          ...oldArray.slice(i + 1),
        ]);
      }, (i + 1) * 1000);
    }
  };
  const onCashOut = async () => {
    if (!clickable) return;
    const req = await fetch(`/slotmachine/cashout`, { method: "POST" });
    const result = await req.json();
    setAccount(getCookieValue("account"));
    setCredits(0);
    setMsg(result?.msg);
  };

  const onHover = () => {
    //50% chance that button moves in a random direction by 300px
    if (Math.random() < 50 / 100) {
      const randomPosition = getRandomArrayElement([
        "top",
        "right",
        "bottom",
        "left",
      ]);
      setCashOutButtonStyle({
        position: "relative",
        [randomPosition]: "300px",
      });
    }
    //40% chance that it becomes unclickable
    if (Math.random() < 40 / 100) {
      setClickable(false);
      // setCashOutButtonStyle((oldObj) => {
      //   return { ...oldObj, pointerEvents: "none" };
      // });
    } else setClickable(true);
  };

  useEffect(() => {
    const onStart = async () => {
      const req = await fetch(`/slotmachine/`, { method: "GET" });
      const result = await req.json();
      setCredits(result?.credits);
      setAccount(getCookieValue("account"));
    };
    onStart();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <table className="slot-machine">
          <tbody>
            <tr>
              {symbolsRolled.map((obj, i) =>
                obj.spinning ? (
                  <th key={i}>X</th>
                ) : (
                  <th key={i}>{obj.symbol[0]?.toUpperCase()}</th>
                )
              )}
              <th>
                <button onClick={onRoll}>roll</button>
              </th>
            </tr>
          </tbody>
        </table>
        {/* <button onClick={onStart}>start</button> */}
        <h6>{symbolsRolled.every((obj) => !obj.spinning) ? credits : "..."}</h6>
        {/* Include a button on the screen that says "CASH OUT", but when the user hovers it, there is 50% chance that button moves in a random direction by 300px, and 40% chance that it becomes unclickable (this roll should be done on client side). If they succeed to hit it, credits from session are moved to their account. */}
        <div className="cash-out-div">
          <button
            className="cash-out-button"
            style={cashOutButtonStyle}
            onClick={onCashOut}
            onMouseEnter={onHover}
          >
            CASH OUT
          </button>
        </div>
        <h4 className="msg">
          {symbolsRolled.every((obj) => !obj.spinning) && msg}
        </h4>

        <h6>Account: {account}</h6>
      </header>
    </div>
  );
}

export default App;
