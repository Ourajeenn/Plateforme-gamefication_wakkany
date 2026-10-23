import { motion } from 'framer-motion';

export default function MotionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon = null,
  ...rest
}) {
  const baseStyle =
    'relative inline-flex items-center justify-center font-bold uppercase tracking-wider transition-colors duration-200 overflow-hidden select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'px-4 py-2 text-[11px] rounded-lg gap-1.5',
    md: 'px-6 py-3 text-xs rounded-xl gap-2',
    lg: 'px-8 py-4 text-sm rounded-2xl gap-2.5',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] text-zinc-950 shadow-[0_4px_18px_rgba(217,119,6,0.35)] hover:shadow-[0_6px_25px_rgba(217,119,6,0.55)] border border-[#fcd34d]/50',
    secondary:
      'bg-zinc-800/90 text-white hover:bg-zinc-700/90 border border-white/10 shadow-md',
    outline:
      'bg-transparent text-[#c28e3a] border-2 border-[#c28e3a] hover:bg-[#c28e3a]/15 shadow-[0_0_15px_rgba(194,142,58,0.2)]',
    ghost:
      'bg-transparent text-zinc-300 hover:text-white hover:bg-white/5',
    danger:
      'bg-red-600/90 text-white hover:bg-red-500 border border-red-400/40 shadow-[0_4px_14px_rgba(220,38,38,0.35)]',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.96, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`${baseStyle} ${sizeStyles[size] || sizeStyles.md} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
