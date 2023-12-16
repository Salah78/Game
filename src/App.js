// App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SnakeGame from "./SnakeGame";
import HangmanGame from "./HangmanGame";
import hangmanImage from "../src/images/Pendu.png"; // Adjust the path to your image
import snakeImage from "../src/images/snake.jpg"; // Adjust the path to your image
import "./App.css";

const Home = () => (
  <div>
    <h1 className="title-text">Jouez Pour Débloquer mon portefolio</h1>
    <div className="console-container">
      <img
        className="console-frame"
        src={require("./images/console.png")}
        alt="Console Frame"
      />
      <div className="container">
        <Link to="/snake" className="game-window">
          <img src={snakeImage} alt="Snake" />
        </Link>
        <Link to="/hangman" className="game-window">
          <img src={hangmanImage} alt="Hangman" />
        </Link>
      </div>
    </div>
  </div>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/snake" element={<SnakeGame />} />
      <Route path="/hangman" element={<HangmanGame />} />
    </Routes>
  </Router>
);

export default App;
