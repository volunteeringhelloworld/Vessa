import { useEffect, useState, type CSSProperties } from "react";

const COLORS = ["bg-coral", "bg-rose", "bg-honey", "bg-apricot", "bg-blush", "bg-coral-soft"];

interface Piece {
  left: number;
  delay: number;
  dur: number;
  drift: number;
  spin: number;
  w: number;
  h: number;
  color: string;
  round: boolean;
}

/** Lightweight CSS confetti; pieces are generated after mount to keep SSR output stable. */
export function Confetti({ count = 70 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        dur: 3 + Math.random() * 2.2,
        drift: (Math.random() - 0.5) * 160,
        spin: 360 + Math.random() * 540,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        color: COLORS[i % COLORS.length] ?? "bg-coral",
        round: Math.random() > 0.7,
      })),
    );
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`animate-confetti absolute top-0 ${p.color} ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.round ? p.w : p.h,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
