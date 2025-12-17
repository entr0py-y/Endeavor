import React, { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
    shouldPlay: boolean;
}

export default function BackgroundMusic({ shouldPlay }: BackgroundMusicProps) {
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

    const playMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = 5;
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

    return (
        <button
            onClick={toggleMusic}
            className={`fixed bottom-[6.5rem] right-8 z-[9999] cursor-pointer font-space-mono text-xs tracking-[0.3em] transition-colors duration-300 bg-transparent border-none outline-none pointer-events-auto ${isPlaying ? 'text-red-500' : 'text-black hover:text-red-500'}`}
        >
            {isPlaying ? '<MUSIC ON/>' : '<MUSIC OFF/>'}
        </button>
    );
}
