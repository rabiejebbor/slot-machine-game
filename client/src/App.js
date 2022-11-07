import React, { useState, useEffect } from "react";
import cherry from "./imgs/cherry.svg";
import lemon from "./imgs/lemon.svg";
import orange from "./imgs/orange.svg";
import watermelon from "./imgs/watermelon.svg";
import "./App.css";

const symbols = [
  { symbol: "cherry", spinning: false, svg: cherry },
  { symbol: "lemon", spinning: false, svg: lemon },
  { symbol: "orange", spinning: false, svg: orange },
  { symbol: "watermelon", spinning: false, svg: watermelon },
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
  //for spinning animation
  const [randomSymbols, setRandomSymbols] = useState(
    getRandomisedArray(symbols)
  );
  const [clickable, setClickable] = useState(true);

  const onRoll = async () => {
    const req = await fetch(`/slotmachine/leverpull`, { method: "POST" });
    const result = await req.json();
    const { credits, symbolsRolled: newSymbolsRolled, win, msg } = result;
    const formattedSymbolsArray = newSymbolsRolled.map((symbol) => {
      return {
        ...symbols.find((obj) => obj.symbol === symbol),
        spinning: true,
      };
    });
    setCredits(credits);
    setSymbolsRolled(formattedSymbolsArray);
    setMsg(msg);

    // spinning animation
    loopThroughSvgs(formattedSymbolsArray.length, symbols);

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
    } else setClickable(true);
  };

  const loopThroughSvgs = (DurationInSeconds, array) => {
    const intervalId = window.setInterval(function () {
      setRandomSymbols(getRandomisedArray(array));
    }, 150);
    setTimeout(() => {
      clearInterval(intervalId);
    }, DurationInSeconds * 1000);
  };

  useEffect(() => {
    const onStart = async () => {
      const req = await fetch(`/slotmachine/`, { method: "GET" });
      const result = await req.json();
      setCredits(result?.credits);
    };
    onStart();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Slot Machine Game</h2>
        <table className="slot-machine">
          <tbody>
            <tr>
              {symbolsRolled.map((obj, i) =>
                obj.spinning ? (
                  <th key={i}>
                    <img
                      style={{ height: "50px", width: "50px" }}
                      src={randomSymbols[i].svg}
                      alt={"spinning svg"}
                    />
                  </th>
                ) : (
                  <th key={i}>
                    <img
                      style={{ height: "50px", width: "50px" }}
                      src={obj.svg}
                      alt={obj.symbol}
                    />
                  </th>
                )
              )}
              <th>
                <button onClick={onRoll}>roll</button>
              </th>
            </tr>
          </tbody>
        </table>
        <button
          className="cash-out-button"
          style={cashOutButtonStyle}
          onClick={onCashOut}
          onMouseEnter={onHover}
        >
          CASH OUT
        </button>
        <h4 className="msg">
          {symbolsRolled.every((obj) => !obj.spinning) && msg}
        </h4>
        <h6>
          Credits:{" "}
          {symbolsRolled.every((obj) => !obj.spinning) ? credits : "..."}
          <span></span>
          Account: {account}
        </h6>
      </header>
    </div>
  );
}

export default App;
