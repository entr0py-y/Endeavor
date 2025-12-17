import React, { useEffect, useRef } from 'react';

interface ScrollPrismProps {
    currentIndex: number;
    totalSections: number;
}

export default function ScrollPrism({ currentIndex, totalSections }: ScrollPrismProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef({ x: 0, y: 0, z: 0 });
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // Responsive scale: larger on desktop, smaller on mobile
        const isDesktop = window.innerWidth >= 768;
        const scale = isDesktop ? 1.2 : 0.9;
        const size = isDesktop ? 200 : 160;
        canvas.width = size * 2;
        canvas.height = size * 2;

        // Prism vertices (triangular prism)
        const baseVertices = [
            [0, -50 * scale, 0],
            [-40 * scale, 25 * scale, 0],
            [40 * scale, 25 * scale, 0],
        ];

        const vertices = [
            ...baseVertices.map(v => [...v.slice(0, 2), -35 * scale] as [number, number, number]),
            ...baseVertices.map(v => [...v.slice(0, 2), 35 * scale] as [number, number, number]),
        ];

        const faces = [
            { indices: [0, 1, 2], color: 'rgba(220, 20, 60, 0.4)' },
            { indices: [3, 4, 5], color: 'rgba(220, 20, 60, 0.25)' },
            { indices: [0, 3, 4, 1], color: 'rgba(220, 20, 60, 0.35)' },
            { indices: [1, 4, 5, 2], color: 'rgba(220, 20, 60, 0.35)' },
            { indices: [2, 5, 3, 0], color: 'rgba(220, 20, 60, 0.35)' },
        ];

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
                ctx.strokeStyle = 'rgba(220, 20, 60, 0.8)';
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
    }, []);

    // Y position moves from 15% (top) to 85% (bottom) based on current section
    const yPosition = 15 + (currentIndex / Math.max(totalSections - 1, 1)) * 70;

    return (
        <div
            className="fixed z-50 pointer-events-none"
            style={{
                left: '-20px',
                top: `${yPosition}%`,
                transform: 'translateY(-50%)',
                transition: 'top 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: window.innerWidth >= 768 ? '160px' : '120px',
                    height: window.innerWidth >= 768 ? '160px' : '120px',
                }}
            />
            {/* Vertical track line on the left */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-nothing-red/30 to-transparent"
                style={{
                    height: '200vh',
                    top: '-100vh',
                    zIndex: -1,
                }}
            />
        </div>
    );
}
