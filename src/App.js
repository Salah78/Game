// App.js

import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import SnakeGame from "./SnakeGame";
import HangmanGame from "./HangmanGame";
import "./App.css";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();
  const audioCtxRef = useRef(null);

  const games = [
    {
      path: "/snake",
      title: "Snake Rush",
      subtitle: "Grille neon ultra speed",
      badge: "S",
      motif: "snake",
      accent: "#2cf3c1",
    },
    {
      path: "/hangman",
      title: "Pendu Neon",
      subtitle: "Decode avant la chute",
      badge: "H",
      motif: "hang",
      accent: "#ff6ba3",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const ensureAudioContext = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  };

  const playTone = (freq = 880, duration = 0.14, type = "square", volume = 0.12) => {
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
  };

  const playHover = () => playTone(1180, 0.07, "square", 0.1);

  const playLaunch = () => {
    playTone(520, 0.18, "sawtooth", 0.16);
    setTimeout(() => playTone(880, 0.14, "square", 0.14), 80);
  };

  const handleLaunch = (game) => {
    if (launching) return;
    playLaunch();
    setSelectedGame(game);
    setLaunching(true);
    setTimeout(() => navigate(game.path), 1400);
  };

  return (
    <>
      {loading && (
        <div className="initial-loading">
          <div className="loading-bg" />
          <div className="loading-shell">
            <img
              className="loading-console"
              src={require("./images/console.png")}
              alt="Loading Animation"
            />
            <div className="boot-text">
              <span className="label">Booting Switch</span>
              <span className="dots" />
            </div>
          </div>
        </div>
      )}
      <div
        className={`home-shell ${launching ? "is-launching" : ""}`}
        style={{ visibility: loading ? "hidden" : "visible" }}
      >
        <p className="meta-text">Switch mode - Experience immersive</p>
        <h1 className="title-text">Jouez pour debloquer mon portfolio</h1>

        <div className="switch-shell">
          <div className="joycon left">
            <div className="joy-led" />
            <div className="stick" />
            <div className="joy-buttons">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="switch-screen">
            <div className="screen-trim">
              <div className="cam-dot" />
              <div className="speaker-bar">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="screen-header">
              <div className="hud-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="hud-title">
                <span className="pulse-dot" />
                <span>Console Switch View</span>
              </div>
            </div>

            <div className="game-grid">
              {games.map((game) => (
                <button
                  key={game.path}
                  className="game-card"
                  style={{ "--accent": game.accent }}
                  onClick={() => handleLaunch(game)}
                  onMouseEnter={playHover}
                  disabled={launching}
                >
                  <div className={`game-preview motif-${game.motif}`}>
                    <div className="badge-icon">{game.badge}</div>
                    <div className="badge-label">Switch arcade</div>
                    <div className={`motif-layer motif-${game.motif}-layer`}>
                      {game.motif === "snake" && (
                        <>
                          <span className="snake-dot" />
                          <span className="snake-food" />
                        </>
                      )}
                      {game.motif === "hang" && (
                        <>
                          <span className="hang-post" />
                          <span className="hang-top" />
                          <span className="hang-rope" />
                          <span className="hang-head" />
                        </>
                      )}
                    </div>
                    <div className="scanline" />
                  </div>
                  <div className="game-info">
                    <span className="game-title">{game.title}</span>
                    <span className="game-subtitle">{game.subtitle}</span>
                    <span className="cta">Entrer</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="screen-footer">
              <div className="speaker-grill">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="status-bar">
                <span className="led green" />
                <span className="battery">88%</span>
              </div>
            </div>
            <div className="screen-glare" />
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
      </div>

      <div className={`teleport-overlay ${launching ? "active" : ""}`}>
        <div className="teleport-ring" />
        <div className="teleport-core">
          <span className="teleport-text">
            {selectedGame ? `Teleport vers ${selectedGame.title}` : "Stand by"}
          </span>
        </div>
      </div>
    </>
  );
};

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
