import React, { useState, useRef, useEffect } from 'react';
import { SKILL_NODES, CATEGORY_COLORS, CATEGORY_LABELS } from '../data/branches';

// Polar to Cartesian
function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

const RADII = [0, 110, 210, 320]; // tier -> radius in px
const CENTER = { x: 400, y: 400 };
const SVG_SIZE = 800;

function getNodePos(node) {
    const r = RADII[node.tier];
    if (node.tier === 0) return { x: CENTER.x, y: CENTER.y };
    return polarToCartesian(CENTER.x, CENTER.y, r, node.angle);
}

export default function SkillTree({ xp, unlockedSkills, onUnlock }) {
    const [hoveredNode, setHoveredNode] = useState(null);
    const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

    const handleUnlock = (node) => {
        if (unlockedSkills.includes(node.id)) return;
        if (node.xpCost === 0 || (xp >= node.xpCost && node.req.every(r => unlockedSkills.includes(r)))) {
            onUnlock({ id: node.id, xp: node.xpCost });
        }
    };

    const isUnlocked = (id) => unlockedSkills.includes(id);
    const isAvailable = (node) => {
        if (isUnlocked(node.id)) return false;
        if (xp < node.xpCost) return false;
        return !node.req || node.req.every(r => isUnlocked(r));
    };

    const nodePositions = {};
    SKILL_NODES.forEach(n => { nodePositions[n.id] = getNodePos(n); });

    const unlockedCount = unlockedSkills.length;
    const availablePoints = Math.max(0, Math.floor(xp / 50) - unlockedCount);

    return (
        <div className="w-full flex flex-col items-center bg-[#0d0015] rounded-3xl border border-purple-900/30 overflow-hidden relative min-h-[700px]" style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}>
            {/* Ambient background layers */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #1a003085 0%, #0d0015 70%)' }}></div>
                <div className="absolute inset-0 opacity-30" style={{ background: 'conic-gradient(from 0deg at 50% 50%, #2d006833, #0d0015, #2d006833, #0d0015, #2d006833)' }}></div>
            </div>

            {/* Top Nav (visual only) */}
            <div className="relative z-10 w-full flex items-center justify-center gap-8 border-b border-purple-900/30 py-3 px-6 text-xs tracking-[0.3em] text-purple-400/60 font-bold uppercase">
                {['CARTE', 'PERSONNAGE', 'HABITUDES', 'COMPÉTENCES', 'BIBLIOTHÈQUE'].map(item => (
                    <span key={item} className={item === 'COMPÉTENCES' ? 'text-white border-b-2 border-purple-400 pb-1' : 'hover:text-purple-300 cursor-pointer transition-colors'}>
                        {item}
                    </span>
                ))}
            </div>

            {/* Main layout */}
            <div className="relative z-10 w-full flex items-center justify-between px-6 py-4" style={{ minHeight: '640px' }}>
                {/* Left Panel */}
                <div className="flex flex-col gap-6 min-w-[120px]">
                    {/* Level */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg width="80" height="80" className="absolute inset-0">
                                <circle cx="40" cy="40" r="36" fill="none" stroke="#4c1d6688" strokeWidth="2" />
                                <circle cx="40" cy="40" r="36" fill="none" stroke="#a855f7" strokeWidth="3"
                                    strokeDasharray={`${Math.PI * 2 * 36 * Math.min(xp / 500, 1)} ${Math.PI * 2 * 36}`}
                                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                            </svg>
                            <span className="text-2xl font-bold text-white relative z-10">{Math.min(Math.floor(xp / 50), 99)}</span>
                        </div>
                        <span className="text-[10px] text-purple-400 font-bold tracking-[0.3em] mt-1">LVL</span>
                    </div>

                    {/* Name */}
                    <div className="text-center">
                        <p className="text-white text-sm font-bold">"{unlockedCount > 0 ? 'Hunter' : 'Neophyte'}"</p>
                        <p className="text-purple-400 text-xs">Aethermoor</p>
                    </div>

                    {/* Category Legend */}
                    <div className="space-y-2 mt-4">
                        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                            <div key={cat} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[cat].main, boxShadow: `0 0 6px ${CATEGORY_COLORS[cat].main}` }}></div>
                                <span className="text-[10px] font-bold tracking-widest" style={{ color: CATEGORY_COLORS[cat].text }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Central SVG Tree */}
                <div className="flex-1 flex items-center justify-center relative">
                    <svg
                        width="100%"
                        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                        style={{ maxWidth: '560px', overflow: 'visible' }}
                    >
                        <defs>
                            {/* Glow filters */}
                            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                            <filter id="specGlow" x="-80%" y="-80%" width="360%" height="360%">
                                <feGaussianBlur stdDeviation="8" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                            <filter id="lineGlow">
                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>

                            {/* Hex pattern background */}
                            <pattern id="hexGrid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                                <polygon points="30,2 58,17 58,47 30,62 2,47 2,17" fill="none" stroke="#4c1d6620" strokeWidth="1" />
                            </pattern>

                            {/* Radial fade for outer glow */}
                            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#6d28d920" />
                                <stop offset="100%" stopColor="#6d28d900" />
                            </radialGradient>
                        </defs>

                        {/* Background hex grid */}
                        <rect width={SVG_SIZE} height={SVG_SIZE} fill="url(#hexGrid)" opacity="0.6" />

                        {/* Outer glow ring */}
                        <circle cx={CENTER.x} cy={CENTER.y} r="340" fill="url(#bgGlow)" />

                        {/* Concentric hex outlines (decorative) */}
                        {[80, 155, 255, 360].map((r, i) => {
                            const pts = Array.from({ length: 6 }, (_, k) => {
                                const p = polarToCartesian(CENTER.x, CENTER.y, r, k * 60);
                                return `${p.x},${p.y}`;
                            }).join(' ');
                            return <polygon key={i} points={pts} fill="none" stroke="#6d28d930" strokeWidth={i === 3 ? 1.5 : 1} strokeDasharray={i % 2 === 0 ? "4,6" : "none"} />;
                        })}

                        {/* Connector lines */}
                        {SKILL_NODES.filter(n => n.req && n.req.length > 0).map(node =>
                            node.req.map(reqId => {
                                const parent = SKILL_NODES.find(n => n.id === reqId);
                                if (!parent) return null;
                                const from = nodePositions[reqId];
                                const to = nodePositions[node.id];
                                const unlocked = isUnlocked(node.id) && isUnlocked(reqId);
                                const available = isAvailable(node) && isUnlocked(reqId);
                                const color = unlocked ? CATEGORY_COLORS[node.category].main : available ? '#ffffff60' : '#ffffff15';
                                return (
                                    <line
                                        key={`${reqId}-${node.id}`}
                                        x1={from.x} y1={from.y}
                                        x2={to.x} y2={to.y}
                                        stroke={color}
                                        strokeWidth={unlocked ? 2.5 : 1.5}
                                        strokeDasharray={unlocked ? 'none' : available ? '6,4' : '3,7'}
                                        filter={unlocked ? 'url(#lineGlow)' : 'none'}
                                        style={{ transition: 'all 0.5s ease' }}
                                    />
                                );
                            })
                        )}

                        {/* Category axis labels */}
                        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                            const catNodes = SKILL_NODES.filter(n => n.category === cat && n.tier === 1);
                            if (!catNodes.length) return null;
                            const avgAngle = catNodes.reduce((s, n) => s + n.angle, 0) / catNodes.length;
                            const pos = polarToCartesian(CENTER.x, CENTER.y, 280, avgAngle);
                            return (
                                <text key={cat} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                                    className="pointer-events-none"
                                    style={{ fill: CATEGORY_COLORS[cat].text, fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', opacity: 0.7 }}>
                                    {label}
                                </text>
                            );
                        })}

                        {/* Skill Nodes */}
                        {SKILL_NODES.map(node => {
                            const pos = nodePositions[node.id];
                            const unlocked = isUnlocked(node.id);
                            const available = isAvailable(node);
                            const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.core;
                            const isSpec = node.isSpec;
                            const nodeR = node.tier === 0 ? 28 : isSpec ? 22 : 14;

                            return (
                                <g key={node.id}
                                    transform={`translate(${pos.x},${pos.y})`}
                                    style={{ cursor: available ? 'pointer' : unlocked ? 'default' : 'not-allowed' }}
                                    onClick={() => handleUnlock(node)}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {/* Outer glow pulse for available nodes */}
                                    {available && (
                                        <circle r={nodeR + 10} fill="none" stroke={color.main} strokeWidth="1" opacity="0.4" className="animate-ping" />
                                    )}

                                    {/* Glow halo for unlocked */}
                                    {unlocked && (
                                        <circle r={nodeR + 8} fill={color.glow} />
                                    )}

                                    {/* Node background */}
                                    {isSpec ? (
                                        // Diamond shape for specializations
                                        <polygon
                                            points={`0,${-nodeR - 8} ${nodeR + 8},0 0,${nodeR + 8} ${-nodeR - 8},0`}
                                            fill={unlocked ? color.main + '30' : '#1a003080'}
                                            stroke={unlocked ? color.main : available ? color.main + '80' : '#4c1d6650'}
                                            strokeWidth={unlocked ? 2.5 : 1.5}
                                            filter={unlocked ? 'url(#specGlow)' : 'none'}
                                        />
                                    ) : (
                                        // Hexagon shape for normal nodes
                                        <polygon
                                            points={Array.from({ length: 6 }, (_, k) => {
                                                const p = polarToCartesian(0, 0, nodeR, k * 60);
                                                return `${p.x},${p.y}`;
                                            }).join(' ')}
                                            fill={unlocked ? color.main + '25' : '#0d001580'}
                                            stroke={unlocked ? color.main : available ? color.main + '70' : '#4c1d6640'}
                                            strokeWidth={unlocked ? 2 : 1}
                                            filter={unlocked ? 'url(#nodeGlow)' : 'none'}
                                        />
                                    )}

                                    {/* Center dot */}
                                    <circle
                                        r={node.tier === 0 ? 10 : isSpec ? 8 : 5}
                                        fill={unlocked ? color.main : available ? color.main + '80' : '#ffffff20'}
                                        filter={unlocked ? 'url(#nodeGlow)' : 'none'}
                                    />

                                    {/* Crown icon for unlocked specs */}
                                    {isSpec && unlocked && (
                                        <text y={-nodeR - 16} textAnchor="middle" style={{ fill: color.main, fontSize: '16px' }}>♦</text>
                                    )}

                                    {/* Node label */}
                                    {(isSpec || node.tier === 0) && (
                                        <>
                                            <text y={isSpec ? nodeR + 22 : nodeR + 18}
                                                textAnchor="middle"
                                                style={{ fill: unlocked ? color.text : '#ffffff50', fontSize: isSpec ? '10px' : '11px', fontWeight: 700, letterSpacing: '0.15em' }}>
                                                {isSpec ? 'SPECIALIZATION' : ''}
                                            </text>
                                            <text y={isSpec ? nodeR + 36 : nodeR + 18}
                                                textAnchor="middle"
                                                style={{ fill: unlocked ? color.text : '#ffffff60', fontSize: isSpec ? '12px' : '12px', fontWeight: 700, letterSpacing: '0.1em' }}>
                                                {node.label}
                                            </text>
                                        </>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Right Panel */}
                <div className="flex flex-col gap-6 min-w-[120px] items-end">
                    <div className="text-center">
                        <p className="text-purple-400/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-2">Points Available</p>
                        <div className="relative w-16 h-16 mx-auto flex items-center justify-center border-2 border-purple-600/50 rotate-45" style={{ background: '#1a003080' }}>
                            <span className="text-2xl font-bold text-white -rotate-45">{availablePoints}</span>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-purple-400/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-2">XP Aether</p>
                        <p className="text-white text-lg font-bold">{xp}</p>
                    </div>

                    {/* Skill list */}
                    <div className="mt-4 space-y-2">
                        <p className="text-[10px] text-purple-400/60 uppercase tracking-widest font-bold">Unlocked</p>
                        {unlockedSkills.map(id => {
                            const node = SKILL_NODES.find(n => n.id === id);
                            if (!node) return null;
                            const color = CATEGORY_COLORS[node.category];
                            return (
                                <div key={id} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color.main }}></div>
                                    <span style={{ color: color.text }} className="text-[10px] font-bold">{node.label}</span>
                                </div>
                            );
                        })}
                        {unlockedSkills.length === 0 && (
                            <p className="text-purple-900/80 text-[10px] italic">No skills yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredNode && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-[#0d0015]/90 border border-purple-700/50 px-6 py-3 rounded-xl backdrop-blur-md text-center min-w-[200px]"
                        style={{ boxShadow: `0 0 20px ${CATEGORY_COLORS[hoveredNode.category].glow}` }}>
                        <p className="text-white font-bold uppercase tracking-widest text-sm">{hoveredNode.label}</p>
                        <p style={{ color: CATEGORY_COLORS[hoveredNode.category].text }} className="text-xs uppercase tracking-widest mt-1 font-bold">
                            {hoveredNode.category.toUpperCase()}
                        </p>
                        <p className="text-purple-400 text-xs mt-2">
                            Cost: <span className="text-white font-bold">{hoveredNode.xpCost} XP</span>
                        </p>
                        {hoveredNode.req && hoveredNode.req.length > 0 && (
                            <p className="text-purple-600 text-[10px] mt-1">
                                Requires: {hoveredNode.req.join(', ')}
                            </p>
                        )}
                        <p className="text-[10px] mt-2 font-bold" style={{
                            color: isUnlocked(hoveredNode.id) ? CATEGORY_COLORS.sustain.main
                                : isAvailable(hoveredNode) ? '#ffffff80'
                                    : '#ff4444'
                        }}>
                            {isUnlocked(hoveredNode.id) ? '✓ UNLOCKED' : isAvailable(hoveredNode) ? '→ CLICK TO UNLOCK' : '✗ LOCKED'}
                        </p>
                    </div>
                </div>
            )}

            {/* Bottom hint */}
            <div className="relative z-10 w-full flex justify-between items-center border-t border-purple-900/30 px-6 py-3">
                <span className="text-[10px] text-purple-400/40 uppercase tracking-widest font-bold">[F] Refund Points</span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">{unlockedSkills.length} / {SKILL_NODES.length} Unlocked</span>
                <span className="text-[10px] text-purple-400/40 uppercase tracking-widest font-bold">[Esc] Back</span>
            </div>
        </div>
    );
}
