import React, { useEffect, useRef, useState } from 'react';

// Get fluid scale based on viewport
const getFluidScale = () => {
  if (typeof window === 'undefined') return 1;
  const vmin = Math.min(window.innerWidth, window.innerHeight);
  return Math.max(0.5, Math.min(1.5, vmin / 1440));
};

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const intensityRef = useRef(0.5);
  const isMovingRef = useRef(false);
  const animationRef = useRef<number>();
  const [fluidScale, setFluidScale] = useState(1);

  useEffect(() => {
    const updateScale = () => setFluidScale(getFluidScale());
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) return;

    const glow = glowRef.current;
    const dot = dotRef.current;
    if (!glow || !dot) return;

    let lastMoveTime = 0;
    let moveTimeout: number;

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current.x = e.clientX;
      positionRef.current.y = e.clientY;
      lastMoveTime = performance.now();
      isMovingRef.current = true;

      clearTimeout(moveTimeout);
      moveTimeout = window.setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Single RAF loop for all cursor updates
    const animate = () => {
      const pos = positionRef.current;
      const scale = getFluidScale();
      
      // Fluid glow size (base 60px scaled)
      const glowSize = 60 * Math.max(0.6, scale * 1.2);
      const dotSize = 6 * Math.max(0.7, scale * 1.1);

      // Smooth intensity transition
      const targetIntensity = isMovingRef.current ? 0.8 : 0.5;
      intensityRef.current += (targetIntensity - intensityRef.current) * 0.15;
      const intensity = intensityRef.current;

      // Update positions using transform (GPU accelerated)
      glow.style.width = `${glowSize}px`;
      glow.style.height = `${glowSize}px`;
      glow.style.transform = `translate3d(${pos.x - glowSize / 2}px, ${pos.y - glowSize / 2}px, 0)`;
      glow.style.opacity = String(intensity);

      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.transform = `translate3d(${pos.x - dotSize / 2}px, ${pos.y - dotSize / 2}px, 0)`;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(moveTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Check for mobile on mount
  if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    return null;
  }

  // Fluid blur and shadow scaling
  const blurSize = Math.round(15 * Math.max(0.6, fluidScale * 1.2));
  const shadowSize1 = Math.round(40 * Math.max(0.6, fluidScale * 1.2));
  const shadowSize2 = Math.round(80 * Math.max(0.6, fluidScale * 1.2));

  return (
    <>
      <div
        ref={glowRef}
        className="fixed pointer-events-none z-50 mix-blend-multiply"
        style={{
          willChange: 'transform, opacity, width, height',
          left: 0,
          top: 0,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0.02) 60%, transparent 80%)',
            filter: `blur(${blurSize}px)`,
            boxShadow: `0 0 ${shadowSize1}px rgba(0, 0, 0, 0.15), 0 0 ${shadowSize2}px rgba(0, 0, 0, 0.07)`,
          }}
        />
      </div>

      <div
        ref={dotRef}
        className="fixed pointer-events-none z-50"
        style={{
          willChange: 'transform, width, height',
          left: 0,
          top: 0,
        }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </div>
    </>
  );
}
