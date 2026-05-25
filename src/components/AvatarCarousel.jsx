import React, { useState, useEffect, useRef } from 'react';

import grid1 from '../assets/histoire/grid1.jpg';
import grid2 from '../assets/histoire/grid2.jpg';

const avatars = [
  { id: '03', name: 'Singe Stratège',    img: grid1, col: 0, row: 0, cols: 4, rows: 3 },
  { id: '04', name: 'Renarde Impériale', img: grid1, col: 1, row: 0, cols: 4, rows: 3 },
  { id: '05', name: 'Tigre Berserker',   img: grid1, col: 2, row: 0, cols: 4, rows: 3 },
  { id: '06', name: 'Faucon Éclaireur',  img: grid1, col: 3, row: 0, cols: 4, rows: 3 },
  { id: '13', name: 'Blaireau Titan',    img: grid1, col: 0, row: 1, cols: 4, rows: 3 },
  { id: '14', name: 'Panthère Mage',     img: grid1, col: 2, row: 1, cols: 4, rows: 3 },
  { id: '15', name: 'Lézard Sage',       img: grid1, col: 3, row: 1, cols: 4, rows: 3 },
  { id: '09', name: 'Singe Héros',       img: grid1, col: 0, row: 2, cols: 4, rows: 3 },
  { id: '10', name: 'Gecko Maître',      img: grid1, col: 1, row: 2, cols: 4, rows: 3 },
  { id: '11', name: 'Hibou Érudit',      img: grid1, col: 2, row: 2, cols: 4, rows: 3 },
  { id: '12', name: 'Gorille Noble',     img: grid1, col: 3, row: 2, cols: 4, rows: 3 },
  { id: '16', name: 'Singe Tireur',      img: grid2, col: 0, row: 0, cols: 3, rows: 2 },
  { id: '17', name: 'Guenon Geisha',     img: grid2, col: 1, row: 0, cols: 3, rows: 2 },
  { id: '18', name: 'Singe Explorateur', img: grid2, col: 2, row: 0, cols: 3, rows: 2 },
  { id: '07', name: 'Guenon du Thé',     img: grid2, col: 1, row: 1, cols: 3, rows: 2 },
  { id: '08', name: 'Singe Ninja',       img: grid2, col: 2, row: 1, cols: 3, rows: 2 },
];

const CARD_W  = 190;
const CARD_H  = 255;
const GAP     = 16;
const VISIBLE = 7;
const CLIP    = 'polygon(10% 0%, 90% 0%, 100% 7%, 100% 93%, 90% 100%, 10% 100%, 0% 93%, 0% 7%)';

/* ── Sprite cell component ───────────────────────────────────────────────── */
function SpriteCell({ avatar, filter }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    let isActive = true;
    const img = new window.Image();

    img.onload = () => {
      if (!isActive) return;

      const { naturalWidth: iw, naturalHeight: ih } = img;
      const cellW = iw / avatar.cols;
      const cellH = ih / avatar.rows;

      // Scale so the cell FILLS the card (cover) — no empty borders
      const sx = CARD_W / cellW;
      const sy = CARD_H / cellH;
      const sc = Math.max(sx, sy);

      const scaledW = Math.round(iw * sc);
      const scaledH = Math.round(ih * sc);
      const sCellW  = Math.round(cellW * sc);
      const sCellH  = Math.round(cellH * sc);

      // Center the exact sprite cell inside the card
      const px = Math.round(-(avatar.col * sCellW) - (sCellW - CARD_W) / 2);
      const py = Math.round(-(avatar.row * sCellH) - (sCellH - CARD_H) / 2);

      setStyle({
        backgroundImage:    `url(${avatar.img})`,
        backgroundSize:     `${scaledW}px ${scaledH}px`,
        backgroundPosition: `${px}px ${py}px`,
        backgroundRepeat:   'no-repeat',
      });
    };

    img.src = avatar.img;

    return () => {
      isActive = false;
    };
  }, [avatar.img, avatar.col, avatar.row, avatar.cols, avatar.rows]);

  return (
    <div
      className="absolute inset-0"
      style={{
        ...style,
        filter,
        transition: 'filter 0.45s ease',
      }}
    />
  );
}

/* ── Main carousel ───────────────────────────────────────────────────────── */
export default function AvatarCarousel() {
  const [centerIdx, setCenterIdx] = useState(2);
  const [glow, setGlow] = useState({ x: 0, y: 0, visible: false });
  const isPausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPausedRef.current) setCenterIdx(p => (p + 1) % avatars.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const handleGlowMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const half    = Math.floor(VISIBLE / 2);
  const visible = Array.from({ length: VISIBLE }, (_, i) => {
    const offset  = i - half;
    const realIdx = (centerIdx + offset + avatars.length) % avatars.length;
    return { avatar: avatars[realIdx], offset, realIdx };
  });

  return (
    <section
      className="w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f0e13 0%, #1a1820 60%, #0f0e13 100%)' }}
      onMouseEnter={() => { isPausedRef.current = true;  }}
      onMouseLeave={() => { isPausedRef.current = false; }}
    >
      {/* Title */}
      <div className="flex flex-col items-center pt-20 pb-12 px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-[#c28e3a]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c28e3a]">Champions du Multivers</span>
          <div className="h-px w-8 bg-[#c28e3a]" />
        </div>
        <h2 className="text-white text-3xl sm:text-5xl font-black italic tracking-tighter font-heading uppercase mb-4 text-center">
          Choisissez votre{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c28e3a] to-yellow-300">Clan</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-xl text-center font-monda">
          {avatars.length} héros uniques répartis en 12 clans puissants. Chaque champion possède des capacités distinctes façonnées par son rang et ses victoires.
        </p>
      </div>

      {/* Cards row */}
      <div className="relative w-full" style={{ height: CARD_H + 60 }}>
        {visible.map(({ avatar, offset, realIdx }) => {
          const dist   = Math.abs(offset);
          const scale  = Math.max(0.62, 1 - dist * 0.1);
          const opac   = dist === 0 ? 1 : dist === 1 ? 0.78 : dist === 2 ? 0.52 : 0.28;
          const zIdx   = VISIBLE - dist;
          const slotX  = offset * (CARD_W + GAP);

          const borderColor = dist === 0 ? '#c28e3a' : dist === 1 ? '#4a8a8a' : '#444';
          const imgFilter   = dist === 0 ? 'none'
            : dist === 1 ? 'brightness(0.55) saturate(0.75)'
            : 'brightness(0.3) saturate(0.5)';

          return (
            <div
              key={`${realIdx}-${offset}`}
              onClick={() => setCenterIdx(realIdx)}
              className="absolute cursor-pointer stabilize-motion"
              style={{
                width:  CARD_W,
                height: CARD_H,
                left:   '50%',
                top:    '50%',
                transform: `translate3d(calc(-50% + ${slotX}px), -50%, 0) scale(${scale})`,
                transformOrigin: 'center center',
                zIndex: zIdx,
                opacity: opac,
                overflow: 'hidden',
                transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease, filter 0.45s ease',
              }}
              onMouseMove={handleGlowMove}
              onMouseEnter={() => setGlow(prev => ({ ...prev, visible: true }))}
              onMouseLeave={() => setGlow(prev => ({ ...prev, visible: false }))}
            >
              {/* White glow follower */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: glow.visible
                    ? `radial-gradient(circle at ${glow.x}px ${glow.y}px, rgba(255,255,255,0.38), rgba(255,255,255,0.12) 28%, transparent 52%)`
                    : 'transparent',
                  opacity: dist === 0 ? 0.9 : 0.55,
                  transition: 'opacity 0.2s ease, background 0.1s linear',
                  mixBlendMode: 'screen',
                }}
              />

              {/* Outer glow (active only) */}
              {dist === 0 && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ clipPath: CLIP, boxShadow: '0 0 50px rgba(194,142,58,0.45)', borderRadius: 4 }} />
              )}

              {/* Frame border + clipped image */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: CLIP,
                  background: `linear-gradient(180deg, ${borderColor} 0%, ${borderColor}66 100%)`,
                  padding: '2.5px',
                }}
              >
                <div
                  className="w-full h-full relative overflow-hidden"
                  style={{ clipPath: CLIP }}
                >
                  <SpriteCell avatar={avatar} filter={imgFilter} />
                </div>
              </div>

              {/* Inner decorative rings — active card */}
              {dist === 0 && (
                <>
                  <div className="absolute pointer-events-none"
                    style={{ inset: 6, clipPath: CLIP, border: '1px solid rgba(194,142,58,0.35)' }} />
                  <div className="absolute pointer-events-none"
                    style={{ inset: 11, clipPath: CLIP, border: '1px solid rgba(194,142,58,0.15)' }} />
                </>
              )}

              {/* Number badge */}
              <div
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  width:  dist === 0 ? 44 : 32,
                  height: dist === 0 ? 44 : 32,
                  bottom: dist === 0 ? -22 : -16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(circle, #252c38 60%, #12101a 100%)',
                  border: `2px solid ${borderColor}`,
                  boxShadow: dist === 0 ? '0 0 14px rgba(194,142,58,0.5)' : 'none',
                  zIndex: 50,
                  transition: 'all 0.45s ease',
                }}
              >
                <span style={{ color: borderColor, fontSize: dist === 0 ? 14 : 10, fontWeight: 700 }}>
                  {avatar.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Name + dots */}
      <div className="flex flex-col items-center pt-10 pb-14">
        <p className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.3em] font-monda mb-6 h-4">
          {avatars[centerIdx].name}
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {avatars.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIdx(i)}
              className="transition-all duration-300 rounded-sm"
              style={{
                width:      centerIdx === i ? 20 : 8,
                height:     8,
                transform:  centerIdx === i ? 'none' : 'rotate(45deg)',
                background: centerIdx === i ? '#c28e3a' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
