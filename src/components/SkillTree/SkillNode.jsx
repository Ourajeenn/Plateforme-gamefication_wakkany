import React from 'react';

export default function SkillNode({ node, branch, isUnlocked, isAvailable, onUnlock, onHover }) {
  const color = branch.color;
  const status = isUnlocked ? 'unlocked' : isAvailable ? 'available' : 'locked';

  return (
    <div 
      className="absolute flex flex-col items-center justify-center group cursor-pointer -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 10 }}
      onMouseEnter={() => onHover(node, branch)}
      onMouseLeave={() => onHover(null, null)}
      onClick={() => {
        if (isUnlocked) return;
        if (isAvailable) {
          onUnlock(node, branch);
        } else {
          onUnlock(null, null); // Signal error/locked click
        }
      }}
    >
      {/* Outer Ring Effect */}
      <div className={`absolute inset-0 rounded-full border border-dashed transition-all duration-[2s] ${status === 'unlocked' ? 'border-white/40 rotate-180 scale-[1.3]' : status === 'available' ? 'border-white/20 animate-[spin_10s_linear_infinite] scale-125' : 'border-transparent scale-100'}`}></div>

      {/* Glow Effect */}
      {(isUnlocked || isAvailable) && (
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isAvailable ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
        ></div>
      )}

      {/* Main Node */}
      <div 
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 relative z-10 
          ${status === 'unlocked' ? 'bg-zinc-900 border-opacity-100 shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(0,0,0,0.8)] scale-110' : 
            status === 'available' ? 'bg-zinc-950 border-opacity-80 border-dashed animate-pulse scale-100' : 
            'bg-zinc-950 border-opacity-20 grayscale opacity-50 scale-90'}`}
        style={{ borderColor: color }}
      >
        {/* Inner dark circle for depth */}
        <div className="absolute inset-1 rounded-full bg-black/60 pointer-events-none"></div>

        <span className="text-xl md:text-2xl relative z-10" style={{ filter: isUnlocked ? `drop-shadow(0 0 5px ${color})` : 'none' }}>
          {node.ultimate ? '⭐' : branch.icon}
        </span>
        
        {/* Tier Indicator */}
        <div className="absolute -bottom-2 right-0 bg-black border border-white/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white/70 shadow-xl">
          {node.tier}
        </div>
      </div>
    </div>
  );
}
