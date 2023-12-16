import React, { useState, useEffect, useRef } from "react";
import "./SnakeGame.css"; // Assurez-vous d'avoir un fichier CSS séparé pour ces styles.
import giphyImage from "./images/giphy.gif";
import snakeDeadImage from "./images/snakeDead.png";

const numRows = 30;
const numCols = 30;

const initialSnake = [{ row: 15, col: 15 }];
const initialDirection = "RIGHT";

const SnakeGame = () => {
  const generateRandomFood = () => {
    const row = Math.floor(Math.random() * numRows);
    const col = Math.floor(Math.random() * numCols);
    return { row, col };
  };

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(generateRandomFood());
  const [direction, setDirection] = useState(initialDirection);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [winning, setWinning] = useState(false);

  const gameRef = useRef();

  const [modalImage, setModalImage] = useState(null);
  const [isGameRunning, setIsGameRunning] = useState(true);

  useEffect(() => {
    if (isGameOver || score >= 2) {
      setIsGameRunning(false);
      setShowModal(true);
      setWinning(score >= 2);
    }
  }, [isGameOver, score]);

  useEffect(() => {
    if (winning) {
      // Chargez l'image de victoire
      const image = new Image();
      image.src = giphyImage;
      setModalImage(image);
    } else {
      // Chargez l'image de défaite
      const image = new Image();
      image.src = snakeDeadImage;
      setModalImage(image);
    }
  }, [winning]);

  useEffect(() => {
    if (isGameOver || score >= 2) {
      setShowModal(true);
      setWinning(score >= 2);
    }
  }, [isGameOver, score]);

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

      // Check for collision with food
      if (head.row === food.row && head.col === food.col) {
        if (score + 1 === 2) {
          // La 20ème nourriture est une image de livre
          setFood({ row: -1, col: -1 }); // Déplacez la nourriture hors de la vue
          setWinning(true);
          setShowModal(true);
          setIsGameRunning(false);
          clearInterval(gameRef.current);
          return;
        }

        setFood(generateRandomFood());
        setScore(score + 1);
      } else {
        newSnake.pop();
      }

      // Check for collision with walls or itself
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
        return;
      }

      setSnake(newSnake);
    };

    gameRef.current = setInterval(moveSnake, 150); // Réduit l'intervalle pour rendre le jeu plus rapide

    return () => clearInterval(gameRef.current);
  }, [snake, food, direction, isGameOver, score, isGameRunning]);

  const checkCollisionWithItself = (snakeArray) => {
    const head = snakeArray[0];
    return snakeArray
      .slice(1)
      .some((segment) => segment.row === head.row && segment.col === head.col);
  };

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
    // Rediriger vers un lien Wikipédia ou effectuer une autre action
    window.location.href =
      "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal";
  };

  return (
    <div className="game-container">
      <div className="score-container">
        <div className="score">Score: {score}</div>
        <div className="snake-animation">
          <img
            src={require("./images/snakeAnim.png")} // Remplacez le chemin par votre image de serpent
            alt="Snake"
            className="snake-image"
          />
        </div>
      </div>

      <div className="grid-container">
        {Array.from({ length: numRows * numCols }).map((_, index) => {
          const row = Math.floor(index / numCols);
          const col = index % numCols;

          const isSnakeSegment = snake.some(
            (segment) => segment.row === row && segment.col === col
          );
          const isFood = food.row === row && food.col === col;

          // Classes pour la cellule de la grille
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            {winning ? (
              <>
                <p>Bravo, vous avez gagné le droit de voir mon portefolio!</p>
                <img
                  src={modalImage.src}
                  alt="Victoire"
                  className="modal-image"
                />
              </>
            ) : (
              <>
                <p>Vous avez perdu!</p>
                <img
                  src={modalImage.src}
                  alt="Défaite"
                  className="modal-image"
                />
              </>
            )}
            <div className="buttons-container">
              <button onClick={resetGame}>Rejouer</button>
              {winning && (
                <button onClick={openPortfolio}>Voir le portefolio</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
