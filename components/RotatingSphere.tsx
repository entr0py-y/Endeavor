import React, { useEffect, useRef } from 'react';

interface RotatingSphereProps {
  scale?: number;
  position?: 'left' | 'right';
}

export default function RotatingSphere({ scale = 1, position = 'left' }: RotatingSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const size = 100 * scale;
    canvas.width = size * 2;
    canvas.height = size * 2;

    // Create cylinder points
    const cylinderPoints: [number, number, number][] = [];
    const rings = 10;
    const pointsPerRing = 20;
    const radius = 30 * scale;
    const height = 60 * scale;

    for (let i = 0; i <= rings; i++) {
      const y = (i / rings) * height - height / 2;

      for (let j = 0; j < pointsPerRing; j++) {
        const phi = (2 * Math.PI * j) / pointsPerRing;
        const x = Math.cos(phi) * radius;
        const z = Math.sin(phi) * radius;
        cylinderPoints.push([x, y, z]);
      }
    }

    const rotateY = (point: [number, number, number], angle: number): [number, number, number] => {
      const [x, y, z] = point;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x * cos + z * sin, y, -x * sin + z * cos];
    };

    const rotateX = (point: [number, number, number], angle: number): [number, number, number] => {
      const [x, y, z] = point;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x, y * cos - z * sin, y * sin + z * cos];
    };

    const project = (point: [number, number, number]): [number, number] => {
      const distance = 200 * scale;
      const scaleFactor = distance / (distance + point[2]);
      return [point[0] * scaleFactor + size, point[1] * scaleFactor + size];
    };

    const animate = () => {
      rotationRef.current += 0.01;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Transform and sort points by depth
      const transformedPoints = cylinderPoints.map(p => {
        let point: [number, number, number] = [...p];
        point = rotateY(point, rotationRef.current);
        point = rotateX(point, rotationRef.current * 0.7);
        return { original: point, projected: project(point) };
      });

      transformedPoints.sort((a, b) => a.original[2] - b.original[2]);

      // Draw points with size based on depth
      transformedPoints.forEach(({ original, projected }) => {
        const depth = original[2];
        const pointSize = (1 + depth / (100 * scale)) * 2 * scale;
        const opacity = 0.3 + (depth / (100 * scale)) * 0.4;

        ctx.beginPath();
        ctx.arc(projected[0], projected[1], pointSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 20, 60, ${opacity})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(projected[0], projected[1], pointSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 20, 60, ${opacity * 0.2})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scale]);

  const positionStyle = position === 'left' 
    ? { left: '-40px', top: '50%' }
    : { right: '-40px', top: '50%' };

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        ...positionStyle,
        transform: 'translateY(-50%)',
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  );
}
