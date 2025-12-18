import React, { useEffect, useRef } from 'react';

interface DotGridBackgroundProps {
    isInverted?: boolean;
}

export default function DotGridBackground({ isInverted = false }: DotGridBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();
    const isInvertedRef = useRef(isInverted);
    const transitionProgress = useRef(isInverted ? 1 : 0); // 0 = normal, 1 = inverted

    // Update ref when prop changes
    useEffect(() => {
        isInvertedRef.current = isInverted;
    }, [isInverted]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Configuration - optimized for performance
        const dotSpacing = 130; // Increased from 115 for fewer dots
        const dotRadius = 0.8;
        const waveSpeed = 0.0005;
        const waveAmplitude = 2;
        const cursorRadius = 100;
        const cursorStrength = 8;
        const transitionSpeed = 0.02;
        const targetFPS = 45;
        const frameTime = 1000 / targetFPS;

        let cols = 0;
        let rows = 0;
        let dots: { baseX: number; baseY: number }[] = [];
        let width = 0;
        let height = 0;
        let lastFrameTime = 0;

        const noise = (x: number, y: number, t: number) => {
            return (
                Math.sin(x * 0.015 + t) * 0.5 +
                Math.sin(y * 0.015 + t * 0.6) * 0.5 +
                Math.sin((x + y) * 0.008 + t * 0.4) * 0.3
            );
        };

        // Lerp function for smooth interpolation
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 1.5); // Cap DPR for performance
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);

            cols = Math.floor(width / dotSpacing);
            rows = Math.floor(height / dotSpacing) + 2;

            dots = [];
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    dots.push({
                        baseX: col * dotSpacing,
                        baseY: row * dotSpacing,
                    });
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
        };

        let startTime = Date.now();

        const animate = (currentTime: number) => {
            // FPS limiting
            if (currentTime - lastFrameTime < frameTime) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }
            lastFrameTime = currentTime;

            const elapsed = (Date.now() - startTime) * waveSpeed;
            const targetProgress = isInvertedRef.current ? 1 : 0;

            // Smooth transition towards target
            transitionProgress.current += (targetProgress - transitionProgress.current) * transitionSpeed;
            const progress = transitionProgress.current;

            // Create dynamic gradient background (moving fog)
            const gradient = ctx.createLinearGradient(0, 0, 0, height);

            // Animate gradient colors slightly for breathing effect
            const t = elapsed * 0.5;

            // Lerp between normal and inverted theme colors based on progress
            // Normal: light grey (65/60/40), Inverted: mid grey (55/50/45)
            const topLightness = lerp(65 + Math.sin(t) * 5, 55 + Math.sin(t) * 3, progress);
            const midLightness = lerp(60 + Math.sin(t + 2) * 5, 50 + Math.sin(t + 2) * 3, progress);
            const botLightness = lerp(40 + Math.sin(t + 4) * 5, 45 + Math.sin(t + 4) * 3, progress);
            const saturation = lerp(15, 12, progress);

            const topColor = `hsl(210, ${saturation}%, ${topLightness}%)`;
            const midColor = `hsl(220, ${saturation}%, ${midLightness}%)`;
            const botColor = `hsl(210, ${saturation}%, ${botLightness}%)`;

            gradient.addColorStop(0, topColor);
            gradient.addColorStop(0.5, midColor);
            gradient.addColorStop(1, botColor);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            // Draw dots - always white on all slides
            ctx.fillStyle = '#FFFFFF';

            dots.forEach((dot, i) => {
                // Calculate wave displacement
                const noiseVal = noise(dot.baseX, dot.baseY, elapsed);
                const waveX = Math.cos(elapsed * 0.5 + dot.baseY * 0.01) * waveAmplitude;
                const waveY = Math.sin(elapsed * 0.5 + dot.baseX * 0.01) * waveAmplitude;

                // Calculate distance to cursor
                const dx = mouseRef.current.x - dot.baseX;
                const dy = mouseRef.current.y - dot.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Breathing/Pulsing Effect (Randomized per dot)
                // Use a combination of elapsed time and dot index/position for pseudo-random pulsing
                // This ensures all dots pulse, not just visible ones
                const randomOffset = (dot.baseX * 13 + dot.baseY * 19);
                const pulseT = elapsed * 0.5 + randomOffset;

                // Base opacity pulsing: 0.2 to 0.5
                const currentOpacity = 0.2 + (Math.sin(pulseT) * 0.5 + 0.5) * 0.3;

                // Smaller dots: Base 1.2px
                let currentRadius = 1.2;

                // Magnification near cursor (only applies if close)
                let shiftX = 0, shiftY = 0;

                if (dist < cursorRadius) {
                    const magFactor = (1 - dist / cursorRadius); // 0 to 1
                    currentRadius += magFactor * 3; // Add up to 3px

                    // Push effect
                    const force = (cursorRadius - dist) / cursorRadius;
                    const angle = Math.atan2(dy, dx);
                    shiftX = Math.cos(angle) * force * cursorStrength;
                    shiftY = Math.sin(angle) * force * cursorStrength;
                }

                const drawX = dot.baseX + waveX + shiftX;
                const drawY = dot.baseY + waveY + shiftY;

                ctx.globalAlpha = Math.max(0, Math.min(1, currentOpacity));
                ctx.beginPath();
                ctx.arc(drawX, drawY, Math.max(0, currentRadius), 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1; // Reset alpha
            animationRef.current = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-500"
            aria-hidden="true"
        />
    );
}

