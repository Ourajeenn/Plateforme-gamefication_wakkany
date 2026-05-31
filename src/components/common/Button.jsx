import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '', disabled = false }) {
  const baseStyle = "px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#c28e3a] text-black hover:brightness-110 shadow-lg shadow-orange-950/30",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10",
    outline: "bg-transparent text-[#c28e3a] border border-[#c28e3a] hover:bg-[#c28e3a]/10"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
