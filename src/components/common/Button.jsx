import { motion } from 'framer-motion';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) {
  const baseStyle =
    'px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary:
      'bg-[#c28e3a] text-black hover:brightness-110 shadow-lg shadow-orange-950/30 border border-[#fcd34d]/40',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10',
    outline: 'bg-transparent text-[#c28e3a] border border-[#c28e3a] hover:bg-[#c28e3a]/10',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.96, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
