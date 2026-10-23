import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedCounter({ value = 0, duration = 1.2, className = '' }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (latest) => Math.round(latest).toLocaleString('fr-FR'));
  const [currentText, setCurrentText] = useState('0');

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setCurrentText(v));
    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      className={`inline-block font-bold tabular-nums ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {currentText}
    </motion.span>
  );
}
