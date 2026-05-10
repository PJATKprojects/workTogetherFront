"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

export function LoginVisualParallax({ children }: Readonly<{ children: ReactNode }>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [xy, setXy] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setXy({ x: px * 5, y: py * 5 });
  }, []);

  const onLeave = useCallback(() => setXy({ x: 0, y: 0 }), []);

  return (
    <div ref={wrapRef} className="relative w-full" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div
        className="motion-reduce:transform-none will-change-transform transition-transform duration-300 ease-out"
        style={{ transform: `translate(${xy.x}px, ${xy.y}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
