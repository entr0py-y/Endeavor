import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues
const RotatingCube = dynamic(() => import('./RotatingCube'), { ssr: false });
const NetworkMesh = dynamic(() => import('./NetworkMesh'), { ssr: false });
const CursorTrail = dynamic(() => import('./CursorTrail'), { ssr: false });
const FollowCube = dynamic(() => import('./FollowCube'), { ssr: false });

interface EnterScreenProps {
    onEnter: () => void;
}

export default function EnterScreen({ onEnter }: EnterScreenProps) {
    const [isHovering, setIsHovering] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);

    // Use RAF for smooth cursor updates instead of state
    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const handleMouseMove = (e: MouseEvent) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-end pb-[clamp(2rem,4vh,4rem)] cursor-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            {/* Web-like structure - Bottom layer */}
            <NetworkMesh />

            {/* Tesseract with coordinates - Background */}
            <RotatingCube />

            {/* Follow Cube - Behind overlay, with GPU-accelerated opacity */}
            <div className="absolute inset-0 z-[1] opacity-50 pointer-events-none" style={{ filter: 'blur(2px)', willChange: 'transform' }}>
                <FollowCube />
            </div>

            {/* Full overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Cursor Trail Effect - on top of overlay */}
            <div className="absolute inset-0 z-[2] pointer-events-none">
                <CursorTrail />
            </div>

            {/* User Quote */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[min(90vw,42rem)] px-[clamp(1rem,4vw,1.5rem)] pointer-events-none select-none z-[3]">
                <p className="font-space-mono text-white text-fluid-lg md:text-fluid-xl glow-white leading-relaxed mb-[clamp(1rem,3vw,1.5rem)] tracking-wide">
                    "The optimist thinks this is the best of all possible worlds; the pessimist fears it is true."
                </p>
                <p className="font-space-mono text-white/80 text-fluid-sm md:text-fluid-base glow-white tracking-widest">
                    - J. Robert Oppenheimer
                </p>
            </div>

            {/* Custom cursor - dot with circle */}
            <div
                ref={cursorRef}
                className="fixed pointer-events-none z-[10000]"
                style={{
                    left: 0,
                    top: 0,
                    willChange: 'transform',
                }}
            >
                {/* Inner dot */}
                <div 
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                    style={{ width: 'clamp(6px, 0.8vmin, 8px)', height: 'clamp(6px, 0.8vmin, 8px)' }}
                />
                {/* Outer circle */}
                <div
                    className={`rounded-full border ${isHovering ? 'border-white scale-125' : 'border-white/50'} transition-all duration-200`}
                    style={{ width: 'clamp(24px, 3vmin, 32px)', height: 'clamp(24px, 3vmin, 32px)' }}
                />
            </div>

            {/* Enter text at bottom */}
            <span
                onClick={onEnter}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="cursor-none relative z-10 font-space-mono text-fluid-xs tracking-[0.2em] text-white/70 hover:text-white transition-colors duration-300"
            >
                &lt;ENTER PORTFOLIO/&gt;
            </span>
        </motion.div>
    );
}
