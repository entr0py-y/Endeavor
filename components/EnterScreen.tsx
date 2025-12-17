import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MicroGlitch from './MicroGlitch';

interface EnterScreenProps {
    onEnter: () => void;
}

export default function EnterScreen({ onEnter }: EnterScreenProps) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-end pb-16 cursor-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onMouseMove={handleMouseMove}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            {/* Full overlay to block gestures */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Custom cursor - dot with circle */}
            <div
                className="fixed pointer-events-none z-[10000] transition-transform duration-150"
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {/* Inner dot */}
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isHovering ? 'bg-white' : 'bg-white'} transition-colors duration-200`} />
                {/* Outer circle */}
                <div
                    className={`w-8 h-8 rounded-full border ${isHovering ? 'border-white scale-125' : 'border-white/50'} transition-all duration-200`}
                />
            </div>

            {/* Enter Text */}
            <div
                className={`relative z-10 mt-8 transition-opacity duration-1000 ${isHovering ? 'opacity-100' : 'opacity-50'}`}
                onClick={onEnter}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <MicroGlitch text="ENTER PORTFOLIO">
                    <span className="font-space-mono text-sm tracking-[0.3em] text-white/70 group-hover:text-white transition-colors duration-300">
                        ENTER PORTFOLIO
                    </span>
                </MicroGlitch>
            </div>
        </motion.div>
    );
}
