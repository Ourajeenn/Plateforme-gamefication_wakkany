import React from 'react';

export default function SkillNode({ node, branch, isUnlocked, isAvailable, onUnlock, onHover }) {
  const color = node.isSpecialColor || branch.color;
  const status = isUnlocked ? 'unlocked' : isAvailable ? 'available' : 'locked';

  if (node.isSemiBoss) {
    return (
      <div 
        className="absolute flex flex-col items-center justify-center group cursor-pointer -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 30 }}
        onMouseEnter={() => onHover(node, branch)}
        onMouseLeave={() => onHover(null, null)}
        onClick={() => {
          if (isUnlocked) return;
          onUnlock(node, branch);
        }}
      >
        {/* Double Rotating Rings */}
        <div className={`absolute inset-0 rounded-full border-2 border-double transition-all duration-[1s] 
          ${status === 'unlocked' ? 'border-purple-400 rotate-180 scale-[1.35]' : status === 'available' ? 'border-purple-400/40 animate-[spin_5s_linear_infinite] scale-125' : 'border-transparent scale-100'}`}></div>

        {/* Dense Radiant Glow */}
        {(isUnlocked || isAvailable) && (
          <div 
            className={`absolute inset-0 rounded-full blur-xl opacity-60 ${isAvailable ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: color }}
          ></div>
        )}

        {/* Elite Badge */}
        <div 
          className={`w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative z-10 
            ${status === 'unlocked' ? 'bg-zinc-950 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.7),inset_0_0_15px_rgba(0,0,0,0.8)] scale-110' : 
              status === 'available' ? 'bg-zinc-950 border-purple-500/50 border-dashed animate-pulse scale-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 
              'bg-zinc-950 border-opacity-20 grayscale opacity-40 scale-90'}`}
        >
          <div className="absolute inset-1 rounded-full bg-black/80 pointer-events-none"></div>

          {/* Core Name */}
          <span 
            className="text-[10px] md:text-[11px] font-heading font-black relative z-10 uppercase tracking-widest text-center px-1 text-purple-400 animate-pulse"
            style={{ 
              textShadow: isUnlocked ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none'
            }}
          >
            {node.name}
          </span>
          
          {/* Elite Skull Indicator */}
          <div className="absolute -bottom-2 right-0 bg-purple-950 border border-purple-500 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-xl">
            👿
          </div>
        </div>

        {/* Elite Label */}
        {node.label && (
          <span 
            className={`absolute -bottom-6 text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500 text-purple-400 animate-pulse`}
          >
            ⚔️ {node.label}
          </span>
        )}
      </div>
    );
  }

  if (node.isBoss) {
    return (
      <div 
        className="absolute flex flex-col items-center justify-center group cursor-pointer -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 40 }}
        onMouseEnter={() => onHover(node, branch)}
        onMouseLeave={() => onHover(null, null)}
        onClick={() => {
          if (isUnlocked) return;
          onUnlock(node, branch);
        }}
      >
        {/* Dragon Orbit Ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-[3s] 
          ${status === 'unlocked' ? 'border-red-500 rotate-360 scale-[1.4]' : status === 'available' ? 'border-red-500/50 animate-[spin_8s_linear_infinite] scale-135' : 'border-transparent scale-100'}`}></div>
        
        {/* Multi-spiked Star Ring (SVG behind the node) */}
        <svg className="absolute inset-[-15px] w-[calc(100%+30px)] h-[calc(100%+30px)] animate-[spin_30s_linear_infinite] pointer-events-none z-0" viewBox="0 0 100 100">
          <polygon 
            points="50,5 64,36 95,36 70,57 81,91 50,70 19,91 30,57 5,36 36,36" 
            fill="none" 
            stroke={isUnlocked ? "#ef4444" : isAvailable ? "rgba(239, 68, 68, 0.3)" : "rgba(82, 82, 91, 0.1)"} 
            strokeWidth="3" 
            strokeDasharray="2,2"
          />
        </svg>

        {/* Intensely Radiant Crimson Glow */}
        {(isUnlocked || isAvailable) && (
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-75 animate-pulse"
            style={{ backgroundColor: "#ef4444" }}
          ></div>
        )}

        {/* Giant Legendary Raid Boss Badge */}
        <div 
          className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative z-10 
            ${status === 'unlocked' ? 'bg-zinc-950 border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.8),inset_0_0_20px_rgba(0,0,0,0.9)] scale-110' : 
              status === 'available' ? 'bg-zinc-950 border-red-500/60 border-double animate-[pulse_1.5s_infinite] scale-100 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 
              'bg-zinc-950 border-opacity-20 grayscale opacity-40 scale-90'}`}
        >
          <div className="absolute inset-1 rounded-full bg-black/90 pointer-events-none"></div>

          {/* Core Name */}
          <span 
            className="text-[11px] md:text-[12px] font-heading font-black relative z-10 uppercase tracking-widest text-center px-1 text-red-500"
            style={{ 
              textShadow: isUnlocked ? "0 0 12px #ef4444, 0 0 25px #ef4444" : "none"
            }}
          >
            {node.name}
          </span>
          
          {/* Boss Crown Indicator */}
          <div className="absolute -bottom-2 right-0 bg-red-950 border border-red-500 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-2xl animate-bounce">
            💀
          </div>
        </div>

        {/* Boss Final Label */}
        {node.label && (
          <span 
            className="absolute -bottom-6 text-[8px] font-black uppercase tracking-[0.25em] text-red-500 animate-[pulse_1s_infinite]"
          >
            🔥 {node.label}
          </span>
        )}
      </div>
    );
  }

  if (node.isRoot) {
    return (
      <div 
        className="absolute flex flex-col items-center justify-center group cursor-pointer -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 20 }}
        onMouseEnter={() => onHover(node, branch)}
        onMouseLeave={() => onHover(null, null)}
        onClick={() => {
          if (!isUnlocked && onUnlock) onUnlock(node, branch);
        }}
      >
        {/* Glowing Orange Hexagon for Root Node */}
        <div className={`w-16 h-16 relative flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95
          ${isUnlocked ? 'filter drop-shadow-[0_0_20px_#ea580c] opacity-100' : 'filter drop-shadow-[0_0_8px_rgba(234,88,12,0.3)] opacity-70'}`}>
          <svg className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
            <polygon 
              points="50,5 93,30 93,80 50,95 7,80 7,30" 
              fill={isUnlocked ? "rgba(234, 88, 12, 0.25)" : "rgba(234, 88, 12, 0.05)"} 
              stroke="#ea580c" 
              strokeWidth="4.5" 
            />
          </svg>
          <span className="text-[9px] font-heading font-black text-white tracking-wider relative z-10">{node.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute flex flex-col items-center justify-center group cursor-pointer -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 10 }}
      onMouseEnter={() => onHover(node, branch)}
      onMouseLeave={() => onHover(null, null)}
      onClick={() => {
        if (isUnlocked) return;
        onUnlock(node, branch);
      }}
    >
      {/* Outer Ring Effect */}
      <div className={`absolute inset-0 rounded-full border border-dashed transition-all duration-[2s] 
        ${status === 'unlocked' ? 'border-white/40 rotate-180 scale-[1.3]' : status === 'available' ? 'border-white/20 animate-[spin_10s_linear_infinite] scale-125' : 'border-transparent scale-100'}`}></div>

      {/* Glow Effect */}
      {(isUnlocked || isAvailable) && (
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isAvailable ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
        ></div>
      )}

      {/* Main Node Badge */}
      <div 
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 relative z-10 
          ${status === 'unlocked' ? 'bg-zinc-950 border-opacity-100 shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(0,0,0,0.8)] scale-110' : 
            status === 'available' ? 'bg-zinc-950 border-opacity-80 border-dashed animate-pulse scale-100' : 
            'bg-zinc-950 border-opacity-20 grayscale opacity-40 scale-90'}`}
        style={{ borderColor: color }}
      >
        {/* Inner dark circle for depth */}
        <div className="absolute inset-1 rounded-full bg-black/70 pointer-events-none"></div>

        {/* Certificate Abbreviated Title */}
        <span 
          className="text-[9px] md:text-[10px] font-heading font-black relative z-10 uppercase tracking-widest text-center px-1"
          style={{ 
            color: isUnlocked ? '#fff' : isAvailable ? `${color}dd` : '#52525b',
            textShadow: isUnlocked ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none'
          }}
        >
          {node.name}
        </span>
        
        {/* Tier Indicator */}
        <div className="absolute -bottom-2 right-0 bg-black border border-white/20 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white/60 shadow-xl">
          {node.tier}
        </div>
      </div>

      {/* Node label/subtitle (Year or RTE) */}
      {node.label && (
        <span 
          className={`absolute -bottom-6 text-[8px] font-black uppercase tracking-widest transition-colors duration-500
            ${status === 'unlocked' ? 'text-white/80' : status === 'available' ? 'text-zinc-400' : 'text-zinc-600'}`}
        >
          {node.label}
        </span>
      )}
    </div>
  );
}
