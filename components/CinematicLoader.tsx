import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicLoaderProps {
    onComplete: () => void;
}

// Fake process messages - easily editable
const LOADING_MESSAGES = [
    'Initializing experience',
    'Loading portfolio',
    'Implementing effects',
    'Calibrating audio',
    'Preparing interface',
];

const MESSAGE_DURATION = 350; // Duration per message in ms
const TOTAL_DURATION = 2000; // Total loader duration in ms
const EXIT_DURATION = 800; // Exit animation duration in ms

export default function CinematicLoader({ onComplete }: CinematicLoaderProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const hasCompletedRef = useRef(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Cycle through messages
    useEffect(() => {
        if (prefersReducedMotion) return;

        const messageInterval = setInterval(() => {
            setCurrentMessageIndex((prev) => {
                if (prev < LOADING_MESSAGES.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, MESSAGE_DURATION);

        return () => clearInterval(messageInterval);
    }, [prefersReducedMotion]);

    // Handle completion after total duration
    useEffect(() => {
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, TOTAL_DURATION);

        const completeTimer = setTimeout(() => {
            if (!hasCompletedRef.current) {
                hasCompletedRef.current = true;
                onComplete();
            }
        }, TOTAL_DURATION + EXIT_DURATION);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    // For reduced motion: show static text, complete after duration
    if (prefersReducedMotion) {
        return (
            <div className="fixed inset-0 z-[9999] bg-neutral-900 flex items-center justify-center">
                <p className="font-space-mono text-xs tracking-[0.2em] text-white/60 uppercase">
                    Loading portfolio...
                </p>
            </div>
        );
    }

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-neutral-900 flex items-center justify-center cursor-none select-none"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        y: -20,
                    }}
                    transition={{
                        duration: EXIT_DURATION / 1000,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                >
                    {/* Subtle gradient overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
                        }}
                    />

                    {/* Message container */}
                    <div className="relative h-6 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentMessageIndex}
                                className="font-space-mono text-xs tracking-[0.15em] text-white/50 uppercase absolute"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{
                                    duration: 0.25,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                            >
                                {LOADING_MESSAGES[currentMessageIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Subtle bottom indicator - thin line that grows */}
                    <motion.div
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 h-px bg-white/20"
                        initial={{ width: 0 }}
                        animate={{ width: 60 }}
                        transition={{
                            duration: TOTAL_DURATION / 1000,
                            ease: 'linear'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
