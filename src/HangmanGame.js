// HangmanGame.js

import React, { useState, useEffect } from "react";
import "./Hangman.css";

const HangmanGame = () => {
  const words = [
    "AUBERGINE",
    "BETTERAVE",
    "CITROUILLE",
    "CONCOMBRE",
    "FRAMBOISE",
    "GROSEILLE",
    "MANDARINE",
    "MIRABELLE",
    "MYRTILLE",
    "PAMPLEMOUSSE",
  ];
  const [word, setWord] = useState(getRandomWord(words));
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    const isGameWon = !word
      .split("")
      .some((letter) => !guessedLetters.includes(letter));
    const isGameLost = mistakes >= 8;

    if (isGameWon) {
      setGameWon(true);
    } else if (isGameLost) {
      setGameOver(true);
    }
  }, [word, guessedLetters, mistakes]);

  const handleLetterClick = (letter) => {
    if (!guessedLetters.includes(letter) && !gameOver && !gameWon) {
      setGuessedLetters([...guessedLetters, letter]);

      if (!word.includes(letter)) {
        setMistakes(mistakes + 1);
      }
    }
  };

  const resetGame = () => {
    setWord(getRandomWord(words));
    setGuessedLetters([]);
    setMistakes(0);
    setGameOver(false);
    setGameWon(false);
  };

  const renderWord = () => {
    return word.split("").map((letter, index) => (
      <span key={index} className="letter">
        {guessedLetters.includes(letter) ? letter : "_"}
      </span>
    ));
  };

  const renderAlphabet = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return alphabet.map((letter) => (
      <button
        key={letter}
        className={`letter-button ${
          guessedLetters.includes(letter) ? "disabled" : ""
        }`}
        onClick={() => handleLetterClick(letter)}
        disabled={guessedLetters.includes(letter) || gameOver || gameWon}
      >
        {letter}
      </button>
    ));
  };

  const renderHangmanImage = () => {
    const hangmanImages = [
      require("./images/pendu1.PNG"),
      require("./images/pendu2.PNG"),
      require("./images/pendu3.PNG"),
      require("./images/pendu4.PNG"),
      require("./images/pendu4.PNG"),
      require("./images/pendu5.PNG"),
      require("./images/pendu6.PNG"),
      require("./images/pendu7.PNG"),
    ];

    return (
      <img src={hangmanImages[mistakes]} alt={`Hangman Mistake ${mistakes}`} />
    );
  };

  const renderPopup = () => {
    if (gameOver) {
      return (
        <div className="popup">
          <h2>Vous avez perdu</h2>
          <p>Le mot était : {word}</p>
          <img
            src={require("./images/pendu8.PNG")}
            alt="Loser"
            className="popup-image"
          />
          <button className="popup-button" onClick={resetGame}>
            Rejouer
          </button>
        </div>
      );
    } else if (gameWon) {
      return (
        <div className="popup">
          <h2>Félicitations !</h2>
          <p>Bravo, vous avez gagné le droit de voir mon portefolio</p>
          <img
            src={require("./images/giphy.gif")}
            alt="Winner"
            className="popup-image"
          />
          <button className="popup-button" onClick={resetGame}>
            Rejouer
          </button>
          <a
            href="https://fr.wikipedia.org/wiki/Portefeuille"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="popup-button">Voir le portefeuille</button>
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="hangman-container">
      <h2>Jeu du Pendu</h2>
      <div className="hangman-image">{renderHangmanImage()}</div>
      <div className="word">{renderWord()}</div>
      <div className="alphabet">{renderAlphabet()}</div>
      {renderPopup()}
    </div>
  );
};

const getRandomWord = (words) =>
  words[Math.floor(Math.random() * words.length)];

export default HangmanGame;