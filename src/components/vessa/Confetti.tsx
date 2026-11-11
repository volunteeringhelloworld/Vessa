import { useEffect, useState } from "react";

const COLORS = ["#E86A5A", "#E07A8A", "#E8B84A", "#F0A070", "#F2C4C4", "#F0A090"];

interface Piece {
  id: number;
  left: number;
  delay: number;
  dur: number;
  drift: number;
  spin: number;
  size: number;
  color: string;
  round: boolean;
}

/**
 * Celebration confetti – falls from the top of the screen.
 * Uses its own injected keyframes so the animation always runs.
 */
export function Confetti({ count = 70 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const styleId = "vessa-confetti-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes vessa-confetti-fall {
          0% {
            opacity: 1;
            transform: translate3d(0, -20px, 0) rotate(0deg);
          }
          85% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--drift), 105vh, 0) rotate(var(--spin));
          }
        }
      `;
      document.head.appendChild(style);
    }

    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.4,
        dur: 2.8 + Math.random() * 2.2,
        drift: (Math.random() - 0.5) * 180,
        spin: (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 500),
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length]!,
        round: Math.random() > 0.65,
      })),
    );
  }, [count]);

  if (pieces.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.round ? p.size : p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: p.round ? "9999px" : "2px",
            ["--drift" as string]: `${p.drift}px`,
            ["--spin" as string]: `${p.spin}deg`,
            animation: `vessa-confetti-fall ${p.dur}s ${p.delay}s linear forwards`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
