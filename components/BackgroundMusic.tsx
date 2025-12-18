import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ScrambleText from './ScrambleText';

interface BackgroundMusicProps {
    shouldPlay: boolean;
    isInverted?: boolean;
}

export default function BackgroundMusic({ shouldPlay, isInverted = false }: BackgroundMusicProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize audio on mount
    useEffect(() => {
        const audio = new Audio('/audio/a-dream-about-you.mp3');
        audio.loop = true;
        audio.volume = 0.3;
        audio.preload = 'auto';

        audio.addEventListener('canplaythrough', () => {
            setIsLoaded(true);
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
        });

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    // Auto-start when user enters (with user gesture already done via Enter click)
    useEffect(() => {
        if (shouldPlay && isLoaded && audioRef.current && !isPlaying) {
            // Small delay to ensure user gesture is registered
            const timer = setTimeout(() => {
                playMusic();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [shouldPlay, isLoaded]);

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleSectionChange = (e: CustomEvent) => {
            if (window.innerWidth < 768) {
                setIsVisible(e.detail === 0);
            } else {
                setIsVisible(true);
            }
        };
        // Verify initial state
        if (window.innerWidth < 768) {
            // We can't easily know the initial section index here without context, 
            // but usually it starts at 0, so visible is correct.
        }

        window.addEventListener('sectionChange', handleSectionChange as EventListener);
        return () => window.removeEventListener('sectionChange', handleSectionChange as EventListener);
    }, []);

    const playMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = 5;
        audio.volume = 0;
        audio.play()
            .then(() => {
                setIsPlaying(true);
                // Fade in
                let vol = 0;
                const fadeIn = setInterval(() => {
                    vol += 0.02;
                    if (vol >= 0.3) {
                        audio.volume = 0.3;
                        clearInterval(fadeIn);
                    } else {
                        audio.volume = vol;
                    }
                }, 50);
            })
            .catch((err) => {
                console.log('Play failed:', err);
                setIsPlaying(false);
            });
    };

    const pauseMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;

        // Fade out
        let vol = audio.volume;
        const fadeOut = setInterval(() => {
            vol -= 0.02;
            if (vol <= 0) {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeOut);
            } else {
                audio.volume = vol;
            }
        }, 50);
    };

    const toggleMusic = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Update state immediately for instant feedback
        setIsPlaying(!isPlaying);

        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    };

    if (!shouldPlay) return null;

    // Dynamic styling based on inverted theme
    const baseClasses = `fixed top-8 right-8 md:top-auto md:bottom-[6.5rem] md:right-8 z-[9999] cursor-pointer font-space-mono text-xs md:text-sm tracking-[0.3em] transition-all duration-500 bg-transparent border-none outline-none`;
    const visibilityClasses = isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none';

    // Music ON = white, Music OFF = black (consistent across all slides)
    const colorClasses = isPlaying
        ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:text-gray-200'
        : 'text-black hover:text-gray-700';

    return (
        <button
            onClick={toggleMusic}
            className={`${baseClasses} ${visibilityClasses} ${colorClasses}`}
        >
            {isPlaying ?
                <ScrambleText text="<MUSIC ON/>" as="span" duration={250} /> :
                <ScrambleText text="<MUSIC OFF/>" as="span" duration={250} />
            }
        </button>
    );
}

