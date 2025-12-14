// HangmanGame.js - version Switch neon

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Hangman.css";

const MAX_MISTAKES = 8;

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

const partsOrder = ["head", "body", "arm-left", "arm-right", "leg-left", "leg-right", "face", "rope"];

const HangmanGame = () => {
  const navigate = useNavigate();
  const [word, setWord] = useState(getRandomWord(words));
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [deathAnim, setDeathAnim] = useState(false);
  const deathSlashTimer = useRef(null);
  const deathSplatTimer = useRef(null);
  const deathModalTimer = useRef(null);
  const audioCtxRef = useRef(null);

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

  const playClick = useCallback(() => playTone(720, 0.06, "square", 0.06), [playTone]);
  const playCorrect = useCallback(() => playTone(880, 0.12, "triangle", 0.1), [playTone]);
  const playHit = useCallback(() => {
    playTone(200, 0.12, "sawtooth", 0.1);
    setTimeout(() => playTone(160, 0.12, "square", 0.08), 70);
  }, [playTone]);
  const playSlash = useCallback(() => {
    playTone(1100, 0.08, "square", 0.12);
    setTimeout(() => playTone(840, 0.07, "triangle", 0.1), 40);
  }, [playTone]);
  const playSplat = useCallback(() => {
    playTone(140, 0.18, "sine", 0.1);
    setTimeout(() => playTone(90, 0.14, "sawtooth", 0.08), 60);
  }, [playTone]);
  const playScream = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, []);
  const playWin = useCallback(() => {
    playTone(540, 0.14, "square", 0.14);
    setTimeout(() => playTone(760, 0.14, "triangle", 0.12), 90);
    setTimeout(() => playTone(980, 0.12, "square", 0.1), 170);
  }, [playTone]);
  const playLose = useCallback(() => {
    playTone(240, 0.18, "sawtooth", 0.1);
    setTimeout(() => playTone(140, 0.16, "sine", 0.08), 120);
  }, [playTone]);

  useEffect(() => {
    const isGameWon = !word
      .split("")
      .some((letter) => !guessedLetters.includes(letter));
    const isGameLost = mistakes >= MAX_MISTAKES;

    if (isGameWon) {
      setGameWon(true);
      playWin();
      setShowEndModal(true);
    } else if (isGameLost) {
      setGameOver(true);
      playLose();
      playSlash();
      setDeathAnim(true);
      deathSlashTimer.current = setTimeout(() => playScream(), 140);
      deathSplatTimer.current = setTimeout(() => playSplat(), 820);
      deathModalTimer.current = setTimeout(() => {
        setShowEndModal(true);
        setDeathAnim(false);
      }, 1100);
    }
  }, [word, guessedLetters, mistakes, playLose, playSlash, playSplat, playScream, playWin]);

  useEffect(() => {
    return () => {
      if (deathSlashTimer.current) clearTimeout(deathSlashTimer.current);
      if (deathSplatTimer.current) clearTimeout(deathSplatTimer.current);
      if (deathModalTimer.current) clearTimeout(deathModalTimer.current);
    };
  }, []);

  const handleLetterClick = (letter) => {
    if (guessedLetters.includes(letter) || gameOver || gameWon) return;

    playClick();
    const isCorrect = word.includes(letter);
    setGuessedLetters([...guessedLetters, letter]);

    if (!isCorrect) {
      setMistakes(mistakes + 1);
      playHit();
    } else {
      playCorrect();
    }
  };

  const resetGame = () => {
    if (deathSlashTimer.current) clearTimeout(deathSlashTimer.current);
    if (deathSplatTimer.current) clearTimeout(deathSplatTimer.current);
    if (deathModalTimer.current) clearTimeout(deathModalTimer.current);
    setWord(getRandomWord(words));
    setGuessedLetters([]);
    setMistakes(0);
    setGameOver(false);
    setGameWon(false);
    setShowEndModal(false);
    setDeathAnim(false);
  };

  const renderWord = () =>
    word.split("").map((letter, index) => (
      <span key={index} className="letter-slot">
        {guessedLetters.includes(letter) ? letter : ""}
      </span>
    ));

  const renderAlphabet = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return alphabet.map((letter) => {
      const disabled = guessedLetters.includes(letter) || gameOver || gameWon;
      return (
        <button
          key={letter}
          className={`letter-button ${disabled ? "disabled" : ""}`}
          onClick={() => handleLetterClick(letter)}
          disabled={disabled}
        >
          {letter}
        </button>
      );
    });
  };

  const remaining = Math.max(0, MAX_MISTAKES - mistakes);
  const statusText = gameWon ? "Victory" : gameOver ? "Game Over" : "En cours";

  return (
    <div className="hangman-page">
      <div className="switch-shell hang-shell">
        <div className="joycon left">
          <div className="joy-led" />
          <div className="stick" />
          <div className="joy-buttons">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="hang-screen">
          <div className="screen-top">
            <div className="title-chip">
              <span className="light-dot" />
              <span>Hangman Neo</span>
            </div>
            <div className="score-chip">
              <span>Restant</span>
              <strong>{remaining}</strong>
            </div>
          </div>

          <div className="play-area">
            <div className="gallows-card">
              <div className={`gallows ${deathAnim ? "death-active" : ""}`}>
                <div className="beam base" />
                <div className="beam post" />
                <div className="beam top" />
                <div className="beam rope" />
                {partsOrder.map((part, index) => (
                  <div
                    key={part}
                    className={`part ${part} ${mistakes > index ? "show" : ""}`}
                  />
                ))}
                {deathAnim && (
                  <div className="death-anim">
                    <div className="knife" />
                    <div className="blood-splash">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </div>
              <div className={`status-chip ${statusText.toLowerCase().replace(" ", "-")}`}>
                {statusText}
              </div>
            </div>

              <div className="word-card">
              <div className="word-display">{renderWord()}</div>
              <div className="alphabet-grid">{renderAlphabet()}</div>
            </div>
          </div>

          <div className="screen-bottom">
            <div className="controls">
              <span className="key">Clique ou tape</span>
              <span>Devine le mot - Style Switch</span>
            </div>
            <div className="hint">Arcade 90s - Neon hang</div>
            <button className="home-button" onClick={() => navigate("/")}>
              Accueil
            </button>
          </div>
        </div>

        <div className="joycon right">
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

      {showEndModal && (
        <div className="modal-overlay">
          <div className={`modal card-${gameWon ? "win" : "lose"}`}>
            <div className="modal-header">
              <span className="badge">{statusText}</span>
              <span className="modal-score">
                Erreurs {mistakes}/{MAX_MISTAKES}
              </span>
            </div>
            <p className="modal-text">
              {gameWon
                ? "Felicitations ! Tu debloques mon portfolio."
                : `Perdu ! Le mot etait : ${word}`}
            </p>
            <div className="buttons-container">
              <button onClick={resetGame}>Rejouer</button>
              {gameWon && (
                <a
                  href="https://bensalah-portfolio.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <button>Voir le portfolio</button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getRandomWord = (wordsList) =>
  wordsList[Math.floor(Math.random() * wordsList.length)];

export default HangmanGame;
