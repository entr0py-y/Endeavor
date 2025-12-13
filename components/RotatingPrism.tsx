import React, { useEffect, useRef } from 'react';

interface RotatingPrismProps {
  scale?: number;
}

export default function RotatingPrism({ scale = 1 }: RotatingPrismProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const size = 200 * scale; // Prism size scaled
    canvas.width = size * 2;
    canvas.height = size * 2;

    // Prism vertices (triangular prism) - scaled
    const baseVertices = [
      [0, -60 * scale, 0],      // Top vertex of triangle
      [-50 * scale, 30 * scale, 0],     // Bottom left
      [50 * scale, 30 * scale, 0],      // Bottom right
    ];

    // Create front and back faces
    const vertices = [
      ...baseVertices.map(v => [...v.slice(0, 2), -40 * scale] as [number, number, number]),  // Front face
      ...baseVertices.map(v => [...v.slice(0, 2), 40 * scale] as [number, number, number]),   // Back face
    ];

    // Define faces (triangles and rectangles)
    const faces = [
      // Front triangle
      { indices: [0, 1, 2], color: 'rgba(220, 20, 60, 0.3)' },
      // Back triangle
      { indices: [3, 4, 5], color: 'rgba(220, 20, 60, 0.2)' },
      // Side rectangles
      { indices: [0, 3, 4, 1], color: 'rgba(220, 20, 60, 0.25)' },
      { indices: [1, 4, 5, 2], color: 'rgba(220, 20, 60, 0.25)' },
      { indices: [2, 5, 3, 0], color: 'rgba(220, 20, 60, 0.25)' },
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
      const scale = distance / (distance + point[2]);
      return [point[0] * scale + size, point[1] * scale + size];
    };

    const animate = () => {
      // Smooth rotation
      rotationRef.current.x += 0.003;
      rotationRef.current.y += 0.005;
      rotationRef.current.z += 0.002;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Transform vertices
      const transformedVertices = vertices.map(v => {
        let point: [number, number, number] = [v[0], v[1], v[2]];
        point = rotateX(point, rotationRef.current.x);
        point = rotateY(point, rotationRef.current.y);
        point = rotateZ(point, rotationRef.current.z);
        return point;
      });

      // Calculate face depths for sorting
      const facesWithDepth = faces.map(face => {
        const avgZ = face.indices.reduce((sum, i) => sum + transformedVertices[i][2], 0) / face.indices.length;
        return { ...face, avgZ };
      });

      // Sort faces by depth (painter's algorithm)
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        opacity: 0.4,
      }}
    />
  );
}
