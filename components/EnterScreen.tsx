import React from 'react';
import { motion } from 'framer-motion';

interface EnterScreenProps {
    onEnter: () => void;
}

export default function EnterScreen({ onEnter }: EnterScreenProps) {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-end pb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            // Block all interactions including swipe gestures
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            {/* Full overlay to block gestures */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Enter text at bottom */}
            <span
                onClick={onEnter}
                className="cursor-pointer relative z-10 font-space-mono text-xs tracking-[0.2em] text-white/70 hover:text-red-500 transition-colors duration-300"
            >
                &lt;ENTER PORTFOLIO/&gt;
            </span>
        </motion.div>
    );
}
