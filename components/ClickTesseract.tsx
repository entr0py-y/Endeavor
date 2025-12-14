import React, { useEffect, useRef } from 'react';

interface ClickTesseractProps {
  x: number;
  y: number;
}

export default function ClickTesseract({ x, y }: ClickTesseractProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0 });
  const animationRef = useRef<number>();
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // 4D tesseract vertices
    const vertices4D: number[][] = [];
    for (let i = 0; i < 16; i++) {
      vertices4D.push([
        (i & 1) ? 0.5 : -0.5,
        (i & 2) ? 0.5 : -0.5,
        (i & 4) ? 0.5 : -0.5,
        (i & 8) ? 0.5 : -0.5,
      ]);
    }

    // Tesseract edges
    const edges: number[][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (vertices4D[i][k] !== vertices4D[j][k]) diff++;
        }
        if (diff === 1) edges.push([i, j]);
      }
    }

    const rotate4D = (point: number[], angles: any) => {
      let [x, y, z, w] = point;
      
      let cos = Math.cos(angles.xy);
      let sin = Math.sin(angles.xy);
      let nx = x * cos - y * sin;
      let ny = x * sin + y * cos;
      x = nx; y = ny;
      
      cos = Math.cos(angles.xz);
      sin = Math.sin(angles.xz);
      nx = x * cos - z * sin;
      let nz = x * sin + z * cos;
      x = nx; z = nz;
      
      cos = Math.cos(angles.xw);
      sin = Math.sin(angles.xw);
      nx = x * cos - w * sin;
      let nw = x * sin + w * cos;
      x = nx; w = nw;
      
      cos = Math.cos(angles.yz);
      sin = Math.sin(angles.yz);
      ny = y * cos - z * sin;
      nz = y * sin + z * cos;
      y = ny; z = nz;
      
      cos = Math.cos(angles.yw);
      sin = Math.sin(angles.yw);
      ny = y * cos - w * sin;
      nw = y * sin + w * cos;
      y = ny; w = nw;
      
      cos = Math.cos(angles.zw);
      sin = Math.sin(angles.zw);
      nz = z * cos - w * sin;
      nw = z * sin + w * cos;
      z = nz; w = nw;
      
      return [x, y, z, w];
    };

    const project4Dto3D = (point: number[]) => {
      const distance = 2;
      const [x, y, z, w] = point;
      const factor = distance / (distance - w);
      return [x * factor, y * factor, z * factor];
    };

    const project3Dto2D = (point: number[], centerX: number, centerY: number, scale: number) => {
      const distance = 3;
      const [x, y, z] = point;
      const factor = distance / (distance - z);
      return [
        centerX + x * factor * scale,
        centerY + y * factor * scale,
        z
      ];
    };

    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / 800, 1);
      
      // Speed up rotation and fade out
      const speedMultiplier = 1 + progress * 4;
      rotationRef.current.xy += 0.03 * speedMultiplier;
      rotationRef.current.xz += 0.02 * speedMultiplier;
      rotationRef.current.xw += 0.025 * speedMultiplier;
      rotationRef.current.yz += 0.02 * speedMultiplier;
      rotationRef.current.yw += 0.03 * speedMultiplier;
      rotationRef.current.zw += 0.025 * speedMultiplier;

      ctx.clearRect(0, 0, size, size);

      const transformedVertices = vertices4D.map(v => {
        const rotated4D = rotate4D(v, rotationRef.current);
        const point3D = project4Dto3D(rotated4D);
        return project3Dto2D(point3D, size / 2, size / 2, 40 * (1 + progress * 0.5));
      });

      // Fade out
      const opacity = 1 - progress;
      ctx.strokeStyle = `rgba(220, 20, 60, ${opacity * 0.6})`;
      ctx.lineWidth = 2;

      edges.forEach(([i, j]) => {
        const [x1, y1] = transformedVertices[i];
        const [x2, y2] = transformedVertices[j];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
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
      className="fixed pointer-events-none z-50"
      style={{
        left: x - 100,
        top: y - 100,
      }}
    />
  );
}
