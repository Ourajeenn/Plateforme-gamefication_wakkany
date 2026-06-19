import React, { useState, useEffect } from 'react';
import { useSoundFX } from '../../hooks/useSoundFX';

export default function GameCountdown({ onComplete }) {
  const [count, setCount] = useState(3);
  const { playCountdownBeep, playCountdownGo, stopBgMusic } = useSoundFX();

  useEffect(() => {
    let timer;
    if (count > 0) {
      playCountdownBeep();
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else {
      stopBgMusic();
      playCountdownGo();
      timer = setTimeout(() => {
        onComplete();
      }, 500); // Short delay to show 'GO!'
    }

    return () => clearTimeout(timer);
  }, [count, playCountdownBeep, playCountdownGo, stopBgMusic, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="text-center animate-breathe">
        <h2 className="text-6xl md:text-9xl font-heading font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#fde68a] via-[#c28e3a] to-[#78350f] drop-shadow-[0_0_30px_rgba(194,142,58,0.5)]">
          {count > 0 ? count : 'GO!'}
        </h2>
      </div>
    </div>
  );
}
