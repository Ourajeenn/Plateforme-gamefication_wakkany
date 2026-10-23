import { motion } from 'framer-motion';

export default function MotionCard({
  children,
  className = '',
  delay = 0,
  hoverGlow = true,
  onClick,
  role,
  ...rest
}) {
  return (
    <motion.div
      onClick={onClick}
      role={role}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={
        onClick || hoverGlow
          ? {
              y: -6,
              scale: 1.015,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={`relative rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl transition-shadow duration-300 ${
        hoverGlow
          ? 'hover:border-[#c28e3a]/60 hover:shadow-[0_0_35px_rgba(194,142,58,0.35)]'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
