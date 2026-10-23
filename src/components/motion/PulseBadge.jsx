import { motion } from 'framer-motion';

export default function PulseBadge({
  children,
  color = 'gold',
  icon = null,
  className = '',
}) {
  const colorStyles = {
    gold: 'border-[#c28e3a]/60 bg-[#c28e3a]/15 text-[#fcd34d] shadow-[0_0_15px_rgba(194,142,58,0.3)]',
    emerald: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    amber: 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    red: 'border-red-500/50 bg-red-500/15 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.25 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
        colorStyles[color] || colorStyles.gold
      } ${className}`}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-current"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.span>
  );
}
