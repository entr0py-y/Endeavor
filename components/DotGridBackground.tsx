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
        const dotSpacing = 80;
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

            // Grid configuration
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

        const animate = () => {
            const elapsed = (Date.now() - startTime) * waveSpeed;

            // Clear canvas to show 3D background (Torus) behind
            ctx.clearRect(0, 0, width, height);

            if (!spotsRef.current) {
                // Initialize spots as clusters (Clouds)
                // Each spot has a main position and multiple sub-blobs to form irregular shape
                spotsRef.current = Array.from({ length: 3 }).map(() => {
                    const radius = 1000 + Math.random() * 1000;
                    return {
                        x: Math.random() * width,
                        y: Math.random() * height,
                        vx: (Math.random() - 0.5) * 0.15,
                        vy: (Math.random() - 0.5) * 0.15,
                        radius: radius, // Base radius
                        // Create 3-5 sub-blobs per cloud
                        subSpots: Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map(() => ({
                            offsetX: (Math.random() - 0.5) * radius * 1.2,
                            offsetY: (Math.random() - 0.5) * radius * 1.2,
                            r: radius * (0.6 + Math.random() * 0.6)
                        }))
                    };
                });
            }

            // Update and draw spots
            spotsRef.current?.forEach((spot: any) => {
                spot.x += spot.vx;
                spot.y += spot.vy;

                // Bounce/Wrap (Loose bounds for large clouds)
                const margin = spot.radius * 2;
                if (spot.x < -margin) spot.x = width + margin;
                if (spot.x > width + margin) spot.x = -margin;
                if (spot.y < -margin) spot.y = height + margin;
                if (spot.y > height + margin) spot.y = -margin;

                // Draw sub-spots
                spot.subSpots.forEach((sub: any) => {
                    const px = spot.x + sub.offsetX;
                    const py = spot.y + sub.offsetY;

                    const gradient = ctx.createRadialGradient(px, py, 0, px, py, sub.r);
                    gradient.addColorStop(0, 'rgba(0,0,0,0.3)'); // Soft dark center
                    gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Fade out

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(px, py, sub.r, 0, Math.PI * 2);
                    ctx.fill();
                });
            });

            // Draw dots (Near Cursor Only)
            ctx.fillStyle = '#1a1a1a'; // Dark grey dots

            dots.forEach((dot, i) => {
                // Calculate wave displacement
                const noiseVal = noise(dot.baseX, dot.baseY, elapsed);
                const waveX = Math.cos(elapsed * 0.5 + dot.baseY * 0.01) * waveAmplitude;
                const waveY = Math.sin(elapsed * 0.5 + dot.baseX * 0.01) * waveAmplitude;

                // Calculate distance to cursor
                const dx = mouseRef.current.x - dot.baseX;
                const dy = mouseRef.current.y - dot.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Visibility radius (larger than interaction radius)
                const visibleRadius = 400;
                let visibility = 0;

                if (dist < visibleRadius) {
                    visibility = Math.pow(1 - dist / visibleRadius, 2); // Squared falloff for smoother edge
                }

                // Interaction push (only if close)
                // The instruction comments out the original interaction push and then re-adds it.
                // I will integrate the re-added part.
                // Original: if (dist < cursorRadius) { ... }
                // New: if (dist < cursorRadius) { ... } // This is just a comment in the instruction, the actual logic is moved below.

                // Breathing/Pulsing Effect
                const pulseT = elapsed * 0.5 + (i * 0.1);

                // Smaller dots: Base 1.2px, varying +/- 0.4px
                let currentRadius = 1.2 + Math.sin(pulseT) * 0.4;

                // Magnification near cursor
                if (dist < cursorRadius) {
                    const magFactor = (1 - dist / cursorRadius); // 0 to 1
                    currentRadius += magFactor * 3; // Add up to 3px
                }

                // Opacity pulsing combined with visibility mask
                // Base pulse 0.4 +/- 0.2, multiplied by visibility factor
                const pulseOpacity = 0.4 + Math.sin(pulseT * 0.7) * 0.2;
                const currentOpacity = pulseOpacity * visibility;

                if (currentOpacity > 0.01) {
                    // Let's keep the push interaction if user wants
                    // re-calculating shift...
                    let shiftX = 0, shiftY = 0;
                    if (dist < cursorRadius) {
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
                }
            });
            ctx.globalAlpha = 1; // Reset alpha
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
