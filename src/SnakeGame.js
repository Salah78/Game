import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SnakeGame.css";
import giphyImage from "./images/giphy.gif";
import snakeDeadImage from "./images/snakeDead.png";

const numRows = 30;
const numCols = 30;

const initialSnake = [{ row: 15, col: 15 }];
const initialDirection = "RIGHT";

const SnakeGame = () => {
  const navigate = useNavigate();
  const audioCtxRef = useRef(null);

  const generateRandomFood = useCallback(() => {
    const row = Math.floor(Math.random() * numRows);
    const col = Math.floor(Math.random() * numCols);
    return { row, col };
  }, []);

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(generateRandomFood());
  const [direction, setDirection] = useState(initialDirection);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [winning, setWinning] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isGameRunning, setIsGameRunning] = useState(true);

  const gameRef = useRef(null);

  const ensureAudioContext = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  };

  const playTone = useCallback((freq, duration, type = "square", volume = 0.08) => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playEat = useCallback(() => playTone(660, 0.12, "triangle", 0.12), [playTone]);
  const playLose = useCallback(() => {
    playTone(220, 0.18, "sawtooth", 0.12);
    setTimeout(() => playTone(140, 0.2, "sawtooth", 0.09), 90);
  }, [playTone]);
  const playWin = useCallback(() => {
    playTone(540, 0.14, "square", 0.14);
    setTimeout(() => playTone(720, 0.14, "triangle", 0.12), 80);
    setTimeout(() => playTone(920, 0.12, "square", 0.1), 150);
  }, [playTone]);

  useEffect(() => {
    if (isGameOver || score >= 2) {
      setIsGameRunning(false);
      setShowModal(true);
      setWinning(score >= 2);
    }
  }, [isGameOver, score]);

  useEffect(() => {
    if (winning) {
      const image = new Image();
      image.src = giphyImage;
      setModalImage(image);
    } else {
      const image = new Image();
      image.src = snakeDeadImage;
      setModalImage(image);
    }
  }, [winning]);

  useEffect(() => {
    if (isGameOver) return;

    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection("UP");
          break;
        case "ArrowDown":
          setDirection("DOWN");
          break;
        case "ArrowLeft":
          setDirection("LEFT");
          break;
        case "ArrowRight":
          setDirection("RIGHT");
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isGameOver]);

  const checkCollisionWithItself = useCallback((snakeArray) => {
    const head = snakeArray[0];
    return snakeArray
      .slice(1)
      .some((segment) => segment.row === head.row && segment.col === head.col);
  }, []);

  useEffect(() => {
    if (isGameOver || !isGameRunning) return;

    const moveSnake = () => {
      if (!isGameRunning) {
        clearInterval(gameRef.current);
        return;
      }

      const newSnake = [...snake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP":
          head.row -= 1;
          break;
        case "DOWN":
          head.row += 1;
          break;
        case "LEFT":
          head.col -= 1;
          break;
        case "RIGHT":
          head.col += 1;
          break;
        default:
          break;
      }

      newSnake.unshift(head);

      if (head.row === food.row && head.col === food.col) {
        if (score + 1 === 2) {
          setFood({ row: -1, col: -1 });
          setWinning(true);
          setShowModal(true);
          setIsGameRunning(false);
          clearInterval(gameRef.current);
          playWin();
          return;
        }

        setFood(generateRandomFood());
        setScore(score + 1);
        playEat();
      } else {
        newSnake.pop();
      }

      if (
        head.row < 0 ||
        head.row >= numRows ||
        head.col < 0 ||
        head.col >= numCols ||
        checkCollisionWithItself(newSnake)
      ) {
        setIsGameOver(true);
        setIsGameRunning(false);
        clearInterval(gameRef.current);
        playLose();
        return;
      }

      setSnake(newSnake);
    };

    gameRef.current = setInterval(moveSnake, 150);
    return () => clearInterval(gameRef.current);
  }, [
    snake,
    food,
    direction,
    isGameOver,
    score,
    isGameRunning,
    generateRandomFood,
    checkCollisionWithItself,
    playEat,
    playLose,
    playWin,
  ]);

  const resetGame = () => {
    setIsGameRunning(true);
    setSnake(initialSnake);
    setFood(generateRandomFood());
    setDirection(initialDirection);
    setIsGameOver(false);
    setShowModal(false);
    setWinning(false);
    setScore(0);
    clearInterval(gameRef.current);
  };

  const openPortfolio = () => {
    window.location.href = "https://bensalah-portfolio.vercel.app/";
  };

  const statusText = winning ? "Victory" : isGameOver ? "Game Over" : "En cours";

  return (
    <div className="snake-page">
      <div className="switch-shell snake-shell">
        <div className="joycon left neon">
          <div className="joy-led" />
          <div className="stick" />
          <div className="joy-buttons">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="snake-screen">
          <div className="screen-top">
            <div className="title-chip">
              <span className="light-dot" />
              <span>Snake Neo</span>
            </div>
            <div className="score-chip">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
          </div>

          <div className="grid-zone">
            <div className="grid-wrapper">
              <div className="grid-overlay" />
              <div className="grid-container">
                {Array.from({ length: numRows * numCols }).map((_, index) => {
                  const row = Math.floor(index / numCols);
                  const col = index % numCols;

                  const isSnakeSegment = snake.some(
                    (segment) => segment.row === row && segment.col === col
                  );
                  const isFood = food.row === row && food.col === col;

                  const cellClasses = [
                    "grid-item",
                    isSnakeSegment ? "snake-segment" : "",
                    isFood && !(score + 1 === 2) ? "food" : "",
                  ].join(" ");

                  return (
                    <div key={index} className={cellClasses}>
                      {isFood && score + 1 === 2 && (
                        <img
                          className="food-image"
                          src={require("./images/portefolio.png")}
                          alt="Book"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="glow-edges" />
            </div>

            <div className="side-panel">
              <div className="status-card">
                <span className="label">Statut</span>
                <span className={`status ${statusText.toLowerCase().replace(" ", "-")}`}>
                  {statusText}
                </span>
                <div className="objective">Portefolio à 2 points</div>
              </div>
              <div className="mini-snake">
                <img src={require("./images/snakeAnim.png")} alt="Snake" />
              </div>
            </div>
          </div>

          <div className="screen-bottom">
          <div className="controls">
            <span className="key">↑ ↓ ← →</span>
            <span>Déplace le serpent ? Arcade 90s</span>
          </div>
            <div className="hint">Switch Mode ? Neon Grid</div>
            <button className="home-button" onClick={() => navigate("/")}>
              Accueil
            </button>
          </div>
        </div>

        <div className="joycon right neon">
          <div className="joy-buttons cluster">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="plus-button">+</div>
          <div className="capture-button" />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className={`modal card-${winning ? "win" : "lose"}`}>
            <div className="modal-header">
              <span className="badge">{statusText}</span>
              <span className="modal-score">Score {score}</span>
            </div>
            <p className="modal-text">
              {winning
                ? "Bravo, tu débloques le portefolio !"
                : "Le serpent s'est écrasé... réessaie !"}
            </p>
            <img
              src={modalImage?.src}
              alt={winning ? "Victoire" : "Défaite"}
              className="modal-image"
            />
            <div className="buttons-container">
              <button onClick={resetGame}>Rejouer</button>
              {winning && <button onClick={openPortfolio}>Voir le portefolio</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
