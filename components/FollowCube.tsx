import React, { useEffect, useRef, useState } from 'react';

// Get fluid scale based on viewport
const getFluidScale = () => {
  if (typeof window === 'undefined') return 1;
  const vmin = Math.min(window.innerWidth, window.innerHeight);
  return Math.max(0.5, Math.min(1.5, vmin / 1440));
};

export default function FollowCube() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  const [isMobile, setIsMobile] = useState(false);
  const [fluidScale, setFluidScale] = useState(1);

  useEffect(() => {
    const updateScales = () => {
      setIsMobile(window.innerWidth < 768);
      setFluidScale(getFluidScale());
    };
    updateScales();
    window.addEventListener('resize', updateScales);
    return () => window.removeEventListener('resize', updateScales);
  }, []);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let lastFrame = 0;
    const targetFrameTime = 1000 / 30; // 30fps is enough for smooth follow

    const animate = (timestamp: number) => {
      // Frame limiting for performance
      if (timestamp - lastFrame < targetFrameTime) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrame = timestamp;

      // Smooth follow with easing
      const ease = 0.12; // Slightly faster easing to compensate for lower fps
      currentPosRef.current.x += (mouseRef.current.x - currentPosRef.current.x) * ease;
      currentPosRef.current.y += (mouseRef.current.y - currentPosRef.current.y) * ease;

      // Use transform3d for GPU acceleration - translate(-50%, -50%) centers the cube on cursor
      cube.style.transform = `translate3d(${currentPosRef.current.x}px, ${currentPosRef.current.y}px, 0) translate(-50%, -50%)`;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (isMobile) return null;

  // Fluid cube size
  const cubeSize = `clamp(60px, 8vmin, 100px)`;
  const borderWidth = `clamp(1px, 0.2vmin, 2px)`;
  const shadowSize = `clamp(10px, 2vmin, 20px)`;

  return (
    <div
      ref={cubeRef}
      className="fixed pointer-events-none z-0"
      style={{
        width: cubeSize,
        height: cubeSize,
        willChange: 'transform',
        left: 0,
        top: 0,
      }}
    >
      <div
        className="w-full h-full animate-spin"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: `${borderWidth} solid rgba(255, 255, 255, 0.6)`,
          boxShadow: `0 0 ${shadowSize} rgba(255, 255, 255, 0.4)`,
          animationDuration: '4s',
        }}
      />
    </div>
  );
}
