import React, { useState, useEffect, useRef } from "react";
import usePlayerData from "../hooks/usePlayerData";
import { useSoundFX } from "../hooks/useSoundFX";

// Simple French spelling game using voice synthesis & recognition
// Features:
// • Fetch a random French word from an open API (Wordnik French endpoint placeholder)
// • Speak the prompt "Comment s'écrit <définition> ?" (here we just read the word)
// • Listen for user response via SpeechRecognition
// • Validate spelling (case‑insensitive, accent‑insensitive)
// • Joker button reveals definition (via API) and plays a special sound
// • Persistent score stored in player data (localStorage)
// • Timer per word (10 seconds default) with visual progress bar

const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/fr/"; // example free French dictionary API

function normalize(str) {
  // Remove accents and convert to lower case for tolerant comparison
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const SpellingVoiceGame = () => {
  const { playerData, setPlayerData } = usePlayerData();
  const { playCorrect, playError, playJoker, playTimerTick } = useSoundFX();
  const [currentWord, setCurrentWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState("idle"); // idle | listening | evaluating
  const [timer, setTimer] = useState(10);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialise persistent spelling score if not present
  useEffect(() => {
    if (playerData.spellingScore === undefined) {
      setPlayerData({ ...playerData, spellingScore: 0 });
    }
  }, []);

  // Fetch a new word + definition
  const fetchWord = async () => {
    try {
      const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      const response = await fetch(`${API_URL}${randomLetter}`);
      const data = await response.json();
      // API returns an array of entries; pick first word that has a definition
      const entry = data.find((e) => e.meanings && e.meanings.length > 0);
      if (!entry) throw new Error("No suitable entry");
      const word = entry.word;
      const def = entry.meanings[0].definitions[0].definition;
      setCurrentWord(word);
      setDefinition(def);
      setUserAnswer("");
      setStatus("idle");
      setTimer(10);
    } catch (e) {
      console.error("Failed to fetch word", e);
    }
  };

  // Speak the prompt
  const speakPrompt = () => {
    const utterance = new SpeechSynthesisUtterance(
      `Comment s'écrit ${definition} ?`
    );
    utterance.lang = "fr-FR";
    speechSynthesis.speak(utterance);
  };

  // Start listening for answer
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }
    const recogn = new SpeechRecognition();
    recogn.lang = "fr-FR";
    recogn.interimResults = false;
    recogn.maxAlternatives = 1;
    recogn.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(transcript);
      evaluateAnswer(transcript);
    };
    recogn.onerror = (event) => {
      console.error("Recognition error", event.error);
      setStatus("idle");
    };
    recogn.start();
    recognitionRef.current = recogn;
    setStatus("listening");
  };

  const evaluateAnswer = (answer) => {
    const isCorrect =
      normalize(answer) === normalize(currentWord);
    if (isCorrect) {
      playCorrect();
      const newScore = (playerData.spellingScore || 0) + 1;
      setPlayerData({ ...playerData, spellingScore: newScore });
      setStatus("correct");
    } else {
      playError();
      setStatus("incorrect");
    }
    clearInterval(timerRef.current);
  };

  // Joker – reveal the word
  const useJoker = () => {
    playJoker();
    alert(`Le mot est : ${currentWord}`);
  };

  // Timer handling
  useEffect(() => {
    if (status === "idle" && currentWord) {
      // start countdown when a new word is ready
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            evaluateAnswer(""); // empty answer → wrong
            return 0;
          }
          playTimerTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status, currentWord]);

  // Initialise first round
  useEffect(() => {
    fetchWord();
  }, []);

  // Handlers for UI buttons
  const handleNext = () => {
    fetchWord();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Jeu d’orthographe vocal</h1>
      <p style={styles.score}>Score : {playerData.spellingScore || 0}</p>
      {currentWord && (
        <div style={styles.gameBox}>
          <p style={styles.timer}>Temps restant: {timer}s</p>
          <button style={styles.button} onClick={speakPrompt}>
            🎤 Écouter l’indice
          </button>
          <button style={styles.button} onClick={startListening} disabled={status === "listening"}>
            🎙️ Répondre
          </button>
          <button style={styles.button} onClick={useJoker}>
            ❓ Joker (définition)
          </button>
          {status === "correct" && <p style={styles.success}>Correct ! 🎉</p>}
          {status === "incorrect" && (
            <p style={styles.error}>Incorrect. Le mot était « {currentWord} ».</p>
          )}
          {(status === "correct" || status === "incorrect") && (
            <button style={styles.nextButton} onClick={handleNext}>
              Prochain mot
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "2rem",
    background: "linear-gradient(135deg, #2c3e50, #4ca1af)",
    borderRadius: "12px",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    textAlign: "center",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    backdropFilter: "blur(8px)",
  },
  title: { marginBottom: "1rem", fontSize: "2rem" },
  score: { marginBottom: "1rem", fontSize: "1.2rem" },
  gameBox: { padding: "1rem", background: "rgba(255,255,255,0.1)", borderRadius: "8px" },
  button: {
    margin: "0.5rem",
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  nextButton: {
    marginTop: "1rem",
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    background: "#27ae60",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
  },
  timer: { marginBottom: "0.5rem" },
  success: { color: "#2ecc71", marginTop: "0.5rem" },
  error: { color: "#e74c3c", marginTop: "0.5rem" },
};

export default SpellingVoiceGame;
