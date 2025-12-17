import React, { useEffect, useRef } from 'react';

interface ScrollPrismProps {
    currentIndex: number;
    totalSections: number;
}

export default function ScrollPrism({ currentIndex, totalSections }: ScrollPrismProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef({ x: 0, y: 0, z: 0 });
    const animationRef = useRef<number>();

    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // Responsive scale: larger on desktop, smaller on mobile
        const scale = isMobile ? 0.9 : 1.2;
        const size = isMobile ? 120 : 200; // Corrected size
        canvas.width = size * 2;
        canvas.height = size * 2;

        // Prism vertices (triangular prism)
        const baseVertices = [
            [0, -50 * scale, 0],
            [-40 * scale, 25 * scale, 0],
            [40 * scale, 25 * scale, 0],
        ];

        // ... vertices setup ...
        const vertices = [
            ...baseVertices.map(v => [...v.slice(0, 2), -35 * scale] as [number, number, number]),
            ...baseVertices.map(v => [...v.slice(0, 2), 35 * scale] as [number, number, number]),
        ];

        const faces = [
            { indices: [0, 1, 2], color: 'rgba(0, 0, 0, 0.4)' },
            { indices: [3, 4, 5], color: 'rgba(0, 0, 0, 0.25)' },
            { indices: [0, 3, 4, 1], color: 'rgba(0, 0, 0, 0.35)' },
            { indices: [1, 4, 5, 2], color: 'rgba(0, 0, 0, 0.35)' },
            { indices: [2, 5, 3, 0], color: 'rgba(0, 0, 0, 0.35)' },
        ];

        // ... Rotation functions (keep same) ...
        const rotateX = (point: [number, number, number], angle: number): [number, number, number] => {
            const [x, y, z] = point;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return [x, y * cos - z * sin, y * sin + z * cos];
        };

        const rotateY = (point: [number, number, number], angle: number): [number, number, number] => {
            const [x, y, z] = point;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return [x * cos + z * sin, y, -x * sin + z * cos];
        };

        const rotateZ = (point: [number, number, number], angle: number): [number, number, number] => {
            const [x, y, z] = point;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return [x * cos - y * sin, x * sin + y * cos, z];
        };

        const project = (point: [number, number, number]): [number, number] => {
            const distance = 300;
            const s = distance / (distance + point[2]);
            return [point[0] * s + size, point[1] * s + size];
        };

        const animate = () => {
            // ... keep animation logic ...
            rotationRef.current.x += 0.008;
            rotationRef.current.y += 0.012;
            rotationRef.current.z += 0.005;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const transformedVertices = vertices.map(v => {
                let point: [number, number, number] = [v[0], v[1], v[2]];
                point = rotateX(point, rotationRef.current.x);
                point = rotateY(point, rotationRef.current.y);
                point = rotateZ(point, rotationRef.current.z);
                return point;
            });

            const facesWithDepth = faces.map(face => {
                const avgZ = face.indices.reduce((sum, i) => sum + transformedVertices[i][2], 0) / face.indices.length;
                return { ...face, avgZ };
            });

            facesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

            facesWithDepth.forEach(face => {
                ctx.beginPath();
                const firstPoint = project(transformedVertices[face.indices[0]]);
                ctx.moveTo(firstPoint[0], firstPoint[1]);

                for (let i = 1; i < face.indices.length; i++) {
                    const point = project(transformedVertices[face.indices[i]]);
                    ctx.lineTo(point[0], point[1]);
                }
                ctx.closePath();

                ctx.fillStyle = face.color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isMobile]); // Re-run effect when mobile state changes

    // Position Calculation
    const progress = 15 + (currentIndex / Math.max(totalSections - 1, 1)) * 70;

    // Desktop: Top%
    // Mobile: Left%

    const containerStyle: React.CSSProperties = isMobile ? {
        left: `${progress}%`,
        bottom: '20px',
        transform: 'translateX(-50%)',
        transition: 'left 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
    } : {
        left: '-20px',
        top: `${progress}%`,
        transform: 'translateY(-50%)',
        transition: 'top 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
    };

    return (
        <div
            className="fixed z-50 pointer-events-none"
            style={containerStyle}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: isMobile ? '120px' : '160px',
                    height: isMobile ? '120px' : '160px',
                }}
            />
            {/* Track Line */}
            {isMobile ? (
                // Horizontal Track (Mobile)
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white to-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{
                        width: '200vw',
                        left: '-100vw',
                        zIndex: -1,
                    }}
                />
            ) : (
                // Vertical Track (Desktop)
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white to-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{
                        height: '200vh',
                        top: '-100vh',
                        zIndex: -1,
                    }}
                />
            )}
        </div>
    );
}
