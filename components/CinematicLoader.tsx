import React, { useEffect, useState, useRef, useCallback } from 'react';
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

// CRITICAL: Fixed minimum duration - NON-NEGOTIABLE
const MINIMUM_DURATION = 2000; // 2 seconds - MUST always complete
const MESSAGE_INTERVAL = 350; // ~350ms per message = ~1750ms total for 5 messages
const EXIT_ANIMATION_DURATION = 600; // Exit transition duration

export default function CinematicLoader({ onComplete }: CinematicLoaderProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Refs to track completion state
    const hasCompletedRef = useRef(false);
    const startTimeRef = useRef<number>(0);
    const assetsReadyRef = useRef(false);
    const timerCompleteRef = useRef(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Try to complete - only when BOTH conditions are met
    const tryComplete = useCallback(() => {
        if (hasCompletedRef.current) return;

        // CRITICAL: Both timer AND assets must be ready
        if (timerCompleteRef.current && assetsReadyRef.current) {
            hasCompletedRef.current = true;
            setIsExiting(true);

            // Wait for exit animation before calling onComplete
            setTimeout(() => {
                onComplete();
            }, EXIT_ANIMATION_DURATION);
        }
    }, [onComplete]);

    // CRITICAL: Fixed 2000ms minimum timer - NON-NEGOTIABLE
    useEffect(() => {
        startTimeRef.current = performance.now();

        // This timer MUST complete before site can show
        const minimumTimer = setTimeout(() => {
            timerCompleteRef.current = true;
            tryComplete();
        }, MINIMUM_DURATION);

        return () => clearTimeout(minimumTimer);
    }, [tryComplete]);

    // Simulate asset loading (in real implementation, this would track actual assets)
    // For now, we mark assets as ready immediately, but the timer still enforces 2s minimum
    useEffect(() => {
        // In a real scenario, you'd track WebGL, audio, images loading here
        // For demonstration, we mark assets ready after a small delay
        const assetTimer = setTimeout(() => {
            assetsReadyRef.current = true;
            tryComplete();
        }, 100); // Assets "ready" almost immediately, but timer still enforces 2s

        return () => clearTimeout(assetTimer);
    }, [tryComplete]);

    // Cycle through messages - fits within the 2000ms window
    useEffect(() => {
        if (prefersReducedMotion) return;
        if (isExiting) return;

        const messageInterval = setInterval(() => {
            setCurrentMessageIndex((prev) => {
                if (prev < LOADING_MESSAGES.length - 1) {
                    return prev + 1;
                }
                return prev; // Stay on last message
            });
        }, MESSAGE_INTERVAL);

        return () => clearInterval(messageInterval);
    }, [prefersReducedMotion, isExiting]);

    // For reduced motion: show static text, still respect 2000ms duration
    if (prefersReducedMotion) {
        return (
            <motion.div
                className="fixed inset-0 z-[9999] bg-neutral-900 flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: isExiting ? 0 : 1 }}
                transition={{ duration: EXIT_ANIMATION_DURATION / 1000 }}
            >
                <p className="font-space-mono text-xs tracking-[0.2em] text-white/60 uppercase">
                    {LOADING_MESSAGES[currentMessageIndex]}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="fixed inset-0 z-[9999] bg-neutral-900 flex items-center justify-center cursor-none select-none"
            initial={{ opacity: 1 }}
            animate={{
                opacity: isExiting ? 0 : 1,
                y: isExiting ? -30 : 0,
            }}
            transition={{
                duration: EXIT_ANIMATION_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1] // Custom easing for premium feel
            }}
        >
            {/* Subtle gradient overlay for depth */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
                }}
            />

            {/* Message container */}
            <div className="relative h-8 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentMessageIndex}
                        className="font-space-mono text-xs tracking-[0.15em] text-white/50 uppercase absolute whitespace-nowrap"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.33, 1, 0.68, 1] // power2.inOut equivalent
                        }}
                    >
                        {LOADING_MESSAGES[currentMessageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Subtle bottom indicator line - grows over 2 seconds */}
            <motion.div
                className="absolute bottom-20 left-1/2 -translate-x-1/2 h-px bg-white/15"
                initial={{ width: 0 }}
                animate={{ width: isExiting ? 80 : 60 }}
                transition={{
                    duration: MINIMUM_DURATION / 1000,
                    ease: 'linear'
                }}
            />
        </motion.div>
    );
}
