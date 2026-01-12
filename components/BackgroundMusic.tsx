import React, { useEffect, useRef, useState, useCallback } from 'react';
import ScrambleText from './ScrambleText';

interface BackgroundMusicProps {
    shouldPlay: boolean;
    isInverted?: boolean;
    onAnalyserReady?: (analyser: AnalyserNode | null) => void;
    onPlayingChange?: (isPlaying: boolean) => void;
}

export default function BackgroundMusic({ shouldPlay, isInverted = false, onAnalyserReady, onPlayingChange }: BackgroundMusicProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const hasAutoStartedRef = useRef(false);
    const wasPlayingRef = useRef(false);

    // Initialize audio on mount
    useEffect(() => {
        const audio = new Audio('/audio/a-dream-about-you.mp3');
        audio.loop = true;
        audio.volume = 0.3;
        audio.preload = 'auto';

        // Track actual play/pause state from audio element
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('canplaythrough', () => setIsLoaded(true));
        audio.addEventListener('error', (e) => console.error('Audio error:', e));

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Setup AudioContext and Analyser
    const setupAudioContext = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || audioContextRef.current) return;

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;
        source.connect(analyser);
        analyser.connect(ctx.destination);

        onAnalyserReady?.(analyser);
    }, [onAnalyserReady]);

    // Play music function
    const playMusic = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !isLoaded) return;

        setupAudioContext();

        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // Only reset time if not resuming from pause
        if (audio.currentTime === 0 || audio.currentTime < 5) {
            audio.currentTime = 5;
        }

        audio.volume = 0;
        audio.play()
            .then(() => {
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
            });
    }, [isLoaded, setupAudioContext]);

    // Pause music function
    const pauseMusic = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

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
    }, []);

    // Auto-start when user enters (only once)
    useEffect(() => {
        if (shouldPlay && isLoaded && !hasAutoStartedRef.current) {
            hasAutoStartedRef.current = true;
            // Delay to ensure user interaction context
            const timer = setTimeout(() => {
                playMusic();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [shouldPlay, isLoaded, playMusic]);

    // Notify parent of playing state changes
    useEffect(() => {
        onPlayingChange?.(isPlaying);
    }, [isPlaying, onPlayingChange]);

    // Handle section visibility on mobile
    useEffect(() => {
        const handleSectionChange = (e: CustomEvent) => {
            if (window.innerWidth < 768) {
                setIsVisible(e.detail === 0);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener('sectionChange', handleSectionChange as EventListener);
        return () => window.removeEventListener('sectionChange', handleSectionChange as EventListener);
    }, []);

    // Pause/resume based on tab visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            const audio = audioRef.current;
            if (!audio) return;

            if (document.hidden) {
                if (!audio.paused) {
                    wasPlayingRef.current = true;
                    audio.pause();
                }
            } else {
                if (wasPlayingRef.current && shouldPlay) {
                    wasPlayingRef.current = false;
                    audio.play().catch(console.error);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [shouldPlay]);

    // Toggle function - single click
    const handleToggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Check actual audio state
        if (!audio.paused) {
            pauseMusic();
        } else {
            playMusic();
        }
    }, [playMusic, pauseMusic]);

    if (!shouldPlay) return null;

    const baseClasses = `fixed top-8 right-8 md:top-auto md:bottom-[6.5rem] md:right-8 z-[9999] cursor-pointer font-space-mono text-xs md:text-sm tracking-[0.3em] transition-all duration-500 bg-transparent border-none outline-none select-none`;
    const visibilityClasses = isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none';

    const colorClasses = isPlaying
        ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] hover:text-gray-200'
        : 'text-black hover:text-gray-700';

    return (
        <button
            onClick={handleToggle}
            className={`${baseClasses} ${visibilityClasses} ${colorClasses}`}
        >
            {isPlaying ?
                <ScrambleText text="<MUSIC ON/>" as="span" duration={250} /> :
                <ScrambleText text="<MUSIC OFF/>" as="span" duration={250} />
            }
        </button>
    );
}
