import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bar {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export default function RedBars() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    let barId = 0;

    const handleClick = (e: MouseEvent) => {
      // Create 4 bars going in all directions
      const newBars: Bar[] = [
        { id: barId++, x: e.clientX, y: e.clientY, delay: 0 }, // right
        { id: barId++, x: e.clientX, y: e.clientY, delay: 0 }, // left
        { id: barId++, x: e.clientX, y: e.clientY, delay: 0 }, // up
        { id: barId++, x: e.clientX, y: e.clientY, delay: 0 }, // down
      ];

      setBars(prev => {
        const combined = [...prev, ...newBars];
        return combined.length > 20 ? combined.slice(-20) : combined;
      });

      setTimeout(() => {
        setBars(prev => prev.filter(bar => !newBars.find(nb => nb.id === bar.id)));
      }, 1500);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {bars.map((bar, index) => {
          const direction = index % 4;
          let style: React.CSSProperties = {};
          let initial: any = {};
          let animate: any = {};
          
          if (direction === 0) {
            // Right
            style = { left: bar.x, top: bar.y - 1, height: '2px', width: '100vw', transformOrigin: '0 center' };
            initial = { scaleX: 0, opacity: 0.8 };
            animate = { scaleX: 1, opacity: 0 };
          } else if (direction === 1) {
            // Left
            style = { right: window.innerWidth - bar.x, top: bar.y - 1, height: '2px', width: '100vw', transformOrigin: '100% center' };
            initial = { scaleX: 0, opacity: 0.8 };
            animate = { scaleX: 1, opacity: 0 };
          } else if (direction === 2) {
            // Up
            style = { left: bar.x - 1, bottom: window.innerHeight - bar.y, width: '2px', height: '100vh', transformOrigin: 'center 100%' };
            initial = { scaleY: 0, opacity: 0.8 };
            animate = { scaleY: 1, opacity: 0 };
          } else {
            // Down
            style = { left: bar.x - 1, top: bar.y, width: '2px', height: '100vh', transformOrigin: 'center 0' };
            initial = { scaleY: 0, opacity: 0.8 };
            animate = { scaleY: 1, opacity: 0 };
          }

          return (
            <motion.div
              key={bar.id}
              className="absolute"
              style={style}
              initial={initial}
              animate={animate}
              exit={{ opacity: 0 }}
              transition={{ 
                scaleX: { duration: 0.6, ease: 'easeOut' },
                scaleY: { duration: 0.6, ease: 'easeOut' },
                opacity: { duration: 1.5, ease: 'easeOut' }
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: direction < 2 
                    ? 'linear-gradient(90deg, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0.8) 80%, transparent 100%)'
                    : 'linear-gradient(180deg, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0.8) 80%, transparent 100%)',
                  boxShadow: '0 0 10px 2px rgba(255,0,0,0.6), 0 0 20px 4px rgba(255,0,0,0.3)',
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
