import React from 'react';
import { motion } from 'framer-motion';

interface EnterScreenProps {
    onEnter: () => void;
}

export default function EnterScreen({ onEnter }: EnterScreenProps) {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-end pb-24 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Title/Greeting could go here, but user asked for minimal button */}

            <button
                onClick={onEnter}
                className="pointer-events-auto group relative px-8 py-3 overflow-hidden bg-transparent border border-white/30 hover:border-nothing-red transition-colors duration-500"
            >
                <span className="relative z-10 font-space-mono text-xs tracking-[0.3em] text-white group-hover:text-nothing-red transition-colors duration-300">
                    ENTER PORTFOLIO
                </span>

                {/* Hover fill effect */}
                <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out opacity-10" />
            </button>
        </motion.div>
    );
}
