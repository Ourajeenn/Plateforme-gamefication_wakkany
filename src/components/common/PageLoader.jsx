import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      {/* Spinning ring */}
      <motion.div
        className="w-14 h-14 rounded-full border-4 border-[#c28e3a]/20 border-t-[#c28e3a]"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
      />
      {/* Pulsing label */}
      <motion.p
        className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.4em]"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
      >
        Chargement...
      </motion.p>
    </div>
  );
}
