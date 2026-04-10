import { useState } from 'react';

const FALLBACK_RIDDLES = {
  "force et combat": [
    { question: "Je n'ai pas de bouche mais je tranche sans bruit. Plus je suis aiguisée, plus je suis redoutée.", answer: "epee", hint: "C'est l'arme de base du guerrier." },
    { question: "Je frappe sans poings et je fends sans hache. Je tombe du ciel mais je ne suis pas vivant.", answer: "foudre", hint: "Un éclair destructeur." }
  ],
  "magie et grimoires": [
    { question: "Je commence par E, je finis par E, mais je n'ai qu'une seule lettre.", answer: "enveloppe", hint: "Elle contient du courrier... ou un parchemin." },
    { question: "Plus j'ai de connaissances, plus je suis lourd, mais je n'ai ni muscles ni os.", answer: "livre", hint: "On m'ouvre pour apprendre." }
  ],
  "discrétion et ombres": [
    { question: "Je suis là quand le soleil se couche, mais je disparais à la lumière d'une bougie.", answer: "obscurite", hint: "Le contraire de la clarté." },
    { question: "Je cours sans jambes et je murmure sans voix. Si on me nomme, je disparais.", answer: "silence", hint: "Chut..." }
  ],
  "default": [
    { question: "Rouge au matin, j'annonce la pluie. Blanc le jour, je suis un nuage.", answer: "ciel", hint: "Regarde en haut." }
  ]
};

export default function useRiddle() {
  const [loading, setLoading] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [error, setError] = useState(null);

  const generateRiddle = async (theme, difficulty) => {
    setLoading(true);
    setError(null);
    
    // Artificial delay to simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // In a real app, you would fetch from your API here
      // const response = await fetch('/api/generate-riddle', { method: 'POST', body: JSON.stringify({ theme, difficulty }) });
      // const data = await response.json();
      
      const themeRiddles = FALLBACK_RIDDLES[theme] || FALLBACK_RIDDLES["default"];
      const randomRiddle = themeRiddles[Math.floor(Math.random() * themeRiddles.length)];
      
      setCurrentRiddle(randomRiddle);
    } catch (err) {
      setError("Erreur lors de la génération de l'énigme.");
    } finally {
      setLoading(false);
    }
  };

  return { generateRiddle, currentRiddle, loading, error };
}
