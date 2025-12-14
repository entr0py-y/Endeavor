import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    let moveTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        setIsMoving(false);
      }, 150);
    };

    // Animate intensity based on movement
    const pulseInterval = setInterval(() => {
      setIntensity(prev => {
        const target = isMoving ? 0.8 : 0.5;
        const diff = target - prev;
        return prev + diff * 0.3;
      });
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(pulseInterval);
      clearTimeout(moveTimeout);
    };
  }, [isMoving]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-screen"
        style={{
          left: position.x - 30,
          top: position.y - 30,
          width: '60px',
          height: '60px',
        }}
        animate={{
          x: 0,
          y: 0,
          opacity: intensity,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 200,
          mass: 0.5,
          opacity: { duration: 0.3, ease: 'easeInOut' }
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255,255,255,${intensity * 0.9}) 0%, rgba(255,255,255,${intensity * 0.5}) 30%, rgba(255,255,255,${intensity * 0.2}) 60%, transparent 80%)`,
            filter: 'blur(20px)',
            boxShadow: `0 0 50px rgba(255,255,255,${intensity * 0.6}), 0 0 90px rgba(255,255,255,${intensity * 0.3})`,
          }}
        />
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          left: position.x - 3,
          top: position.y - 3,
          width: '6px',
          height: '6px',
        }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </motion.div>
    </>
  );
}
