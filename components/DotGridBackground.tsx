import React, { useEffect, useRef } from 'react';

export default function DotGridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Configuration
        const dotSpacing = 30;
        const dotRadius = 0.8;
        const waveSpeed = 0.0005;
        const waveAmplitude = 2;
        const cursorRadius = 100;
        const cursorStrength = 8;

        let cols = 0;
        let rows = 0;
        let dots: { baseX: number; baseY: number }[] = [];
        let width = 0;
        let height = 0;

        const noise = (x: number, y: number, t: number) => {
            return (
                Math.sin(x * 0.015 + t) * 0.5 +
                Math.sin(y * 0.015 + t * 0.6) * 0.5 +
                Math.sin((x + y) * 0.008 + t * 0.4) * 0.3
            );
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);

            cols = Math.ceil(width / dotSpacing) + 2;
            rows = Math.ceil(height / dotSpacing) + 2;

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

        const animate = () => {
            const elapsed = (Date.now() - startTime) * waveSpeed;

            // Create dynamic gradient background (moving fog)
            const gradient = ctx.createLinearGradient(0, 0, 0, height);

            // Animate gradient colors slightly for breathing effect
            const t = elapsed * 0.5;
            const topColor = `hsl(210, 15%, ${65 + Math.sin(t) * 5}%)`;   // #8e9eab range
            const midColor = `hsl(220, 15%, ${60 + Math.sin(t + 2) * 5}%)`; // #8693ab range
            const botColor = `hsl(210, 15%, ${40 + Math.sin(t + 4) * 5}%)`; // #5d6d7e range

            gradient.addColorStop(0, topColor);
            gradient.addColorStop(0.5, midColor);
            gradient.addColorStop(1, botColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            for (const dot of dots) {
                let x = dot.baseX;
                let y = dot.baseY;

                // Apply subtle wave motion
                if (!prefersReducedMotion) {
                    const n = noise(dot.baseX, dot.baseY, elapsed);
                    x += n * waveAmplitude;
                    y += noise(dot.baseY, dot.baseX, elapsed + 50) * waveAmplitude;
                }

                // Cursor interaction - subtle push
                const dx = mx - x;
                const dy = my - y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < cursorRadius && dist > 0) {
                    const force = (1 - dist / cursorRadius) * cursorStrength;
                    x -= (dx / dist) * force;
                    y -= (dy / dist) * force;
                }

                // Calculate dot opacity based on vertical position (fade with gradient)
                const yRatio = y / height;
                const baseOpacity = 0.15 + yRatio * 0.1; // More visible at bottom

                // Draw dot
                ctx.fillStyle = `rgba(40, 40, 40, ${baseOpacity})`;
                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        animate();

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
            className="fixed inset-0 z-[-1] pointer-events-none"
            aria-hidden="true"
        />
    );
}
