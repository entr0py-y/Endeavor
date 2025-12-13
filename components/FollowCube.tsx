import React, { useEffect, useRef } from 'react';

export default function FollowCube() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (cubeRef.current) {
        // Smooth follow with easing
        const ease = 0.08;
        currentPosRef.current.x += (mouseRef.current.x - currentPosRef.current.x) * ease;
        currentPosRef.current.y += (mouseRef.current.y - currentPosRef.current.y) * ease;

        cubeRef.current.style.transform = `translate(${currentPosRef.current.x}px, ${currentPosRef.current.y}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cubeRef}
      className="fixed pointer-events-none z-0"
      style={{
        top: '-50px',
        left: '-50px',
        width: '100px',
        height: '100px',
      }}
    >
      <div
        className="w-full h-full"
        style={{
          background: 'rgba(220, 20, 60, 0.15)',
          border: '2px solid rgba(220, 20, 60, 0.4)',
          boxShadow: '0 0 20px rgba(220, 20, 60, 0.3)',
          animation: 'spin 4s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
