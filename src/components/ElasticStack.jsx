import React, { useState } from "react";

/**
 * ElasticStack — rangée d'avatars circulaires superposés avec animation spring au hover.
 * 
 * Props:
 *   items        — tableau d'objets { id, name, image?, ... }
 *   itemSize     — diamètre de chaque cercle (px), défaut 70
 *   overlap      — chevauchement entre cercles (px), défaut 30
 *   pushForce    — distance de push des voisins (px), défaut 15
 *   renderItem   — (item, index, isHovered) => ReactNode : render custom du contenu du cercle
 *   onItemClick  — (item, index) => void : callback au clic
 *   className    — classes CSS supplémentaires
 */
export function ElasticStack({
  items = [],
  itemSize = 70,
  overlap = 30,
  pushForce = 15,
  renderItem,
  onItemClick,
  className = "",
  ...props
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = items.length;

  // Spring easing calqué sur la CSS d'origine
  const springEasing =
    "linear(0, 0.79 14.4%, 1.026 22.4%, 1.164 31.2%, 1.207 38.2%, 1.208 46.2%, 1.033 80%, 1)";

  return (
    <div
      className={`flex items-center justify-center cursor-pointer py-4 ${className}`}
      onMouseLeave={() => setHoveredIndex(null)}
      {...props}
    >
      {items.map((item, i) => {
        let translateX = 0;
        let scale = 1;
        let zIndex = i;
        const isHovered = hoveredIndex === i;

        if (hoveredIndex !== null) {
          if (i > hoveredIndex) {
            translateX = Math.min(pushForce * (total - i - 1), overlap);
          } else if (i < hoveredIndex) {
            translateX = -Math.min(pushForce * i, overlap);
          } else {
            scale = 1.25;
            zIndex = 100;
          }
        }

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(i)}
            onClick={() => onItemClick && onItemClick(item, i)}
            style={{
              width: itemSize,
              height: itemSize,
              marginLeft: i === 0 ? 0 : -overlap,
              transform: `translateX(${translateX}px) scale(${scale})`,
              transition: "transform 700ms",
              transitionTimingFunction: springEasing,
              zIndex,
              position: "relative",
              flexShrink: 0,
            }}
          >
            {renderItem ? (
              // Render custom fourni (ex: SpriteThumbCircle)
              renderItem(item, i, isHovered)
            ) : (
              // Rendu par défaut : image ou initiale
              <div
                className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  border: isHovered
                    ? "2.5px solid #c28e3a"
                    : "2.5px solid rgba(255,255,255,0.15)",
                  background: "#27272a",
                  boxShadow: isHovered ? "0 0 12px rgba(194,142,58,0.4)" : "none",
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name || `Avatar ${i}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <span className="text-sm font-bold text-zinc-400">
                    {item.name ? item.name.charAt(0) : i + 1}
                  </span>
                )}
              </div>
            )}

            {/* Tooltip */}
            {isHovered && item.name && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 6px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  zIndex: 200,
                  pointerEvents: "none",
                  background: "rgba(0,0,0,0.85)",
                  color: "#c28e3a",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                {item.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ElasticStack;
