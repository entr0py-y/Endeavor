import React, { useEffect, useRef } from 'react';

interface RotatingSmallCubeProps {
  scale?: number;
  position?: 'left' | 'right';
  offset?: number;
}

export default function RotatingSmallCube({ scale = 1, position = 'right', offset = 12 }: RotatingSmallCubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const size = 100 * scale;
    canvas.width = size * 2;
    canvas.height = size * 2;

    // Cube vertices
    const cubeSize = 35 * scale;
    const vertices: [number, number, number][] = [
      [-cubeSize, -cubeSize, -cubeSize],
      [cubeSize, -cubeSize, -cubeSize],
      [cubeSize, cubeSize, -cubeSize],
      [-cubeSize, cubeSize, -cubeSize],
      [-cubeSize, -cubeSize, cubeSize],
      [cubeSize, -cubeSize, cubeSize],
      [cubeSize, cubeSize, cubeSize],
      [-cubeSize, cubeSize, cubeSize],
    ];

    // Cube faces
    const faces = [
      { indices: [0, 1, 2, 3], color: 'rgba(220, 20, 60, 0.3)' },
      { indices: [4, 5, 6, 7], color: 'rgba(220, 20, 60, 0.3)' },
      { indices: [0, 1, 5, 4], color: 'rgba(220, 20, 60, 0.25)' },
      { indices: [2, 3, 7, 6], color: 'rgba(220, 20, 60, 0.25)' },
      { indices: [0, 3, 7, 4], color: 'rgba(220, 20, 60, 0.2)' },
      { indices: [1, 2, 6, 5], color: 'rgba(220, 20, 60, 0.2)' },
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
      const distance = 250 * scale;
      const scaleFactor = distance / (distance + point[2]);
      return [point[0] * scaleFactor + size, point[1] * scaleFactor + size];
    };

    const animate = () => {
      rotationRef.current.x += 0.008;
      rotationRef.current.y += 0.012;
      rotationRef.current.z += 0.006;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Transform vertices
      const transformedVertices = vertices.map(v => {
        let point: [number, number, number] = [...v];
        point = rotateX(point, rotationRef.current.x);
        point = rotateY(point, rotationRef.current.y);
        point = rotateZ(point, rotationRef.current.z);
        return point;
      });

      // Calculate face depths and sort
      const facesWithDepth = faces.map(face => {
        const avgZ = face.indices.reduce((sum, i) => sum + transformedVertices[i][2], 0) / face.indices.length;
        return { ...face, avgZ };
      });

      facesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

      // Draw faces
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
        ctx.strokeStyle = 'rgba(220, 20, 60, 0.6)';
        ctx.lineWidth = 1.5;
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
  }, [scale]);

  const positionStyle = position === 'left'
    ? { left: `${offset}%`, top: '40%' }
    : { right: `${offset}%`, top: '40%' };

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        ...positionStyle,
        transform: 'translateY(-50%)',
        zIndex: 1,
        opacity: 0.4,
      }}
    />
  );
}
