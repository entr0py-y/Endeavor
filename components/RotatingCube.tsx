import React, { useEffect, useRef } from 'react';

export default function RotatingCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 4D rotation matrices
    const rotate4D = (point: number[], angles: any) => {
      let [x, y, z, w] = point;
      
      // Rotate in XY plane
      let cos = Math.cos(angles.xy);
      let sin = Math.sin(angles.xy);
      let nx = x * cos - y * sin;
      let ny = x * sin + y * cos;
      x = nx; y = ny;
      
      // Rotate in XZ plane
      cos = Math.cos(angles.xz);
      sin = Math.sin(angles.xz);
      nx = x * cos - z * sin;
      let nz = x * sin + z * cos;
      x = nx; z = nz;
      
      // Rotate in XW plane
      cos = Math.cos(angles.xw);
      sin = Math.sin(angles.xw);
      nx = x * cos - w * sin;
      let nw = x * sin + w * cos;
      x = nx; w = nw;
      
      // Rotate in YZ plane
      cos = Math.cos(angles.yz);
      sin = Math.sin(angles.yz);
      ny = y * cos - z * sin;
      nz = y * sin + z * cos;
      y = ny; z = nz;
      
      // Rotate in YW plane
      cos = Math.cos(angles.yw);
      sin = Math.sin(angles.yw);
      ny = y * cos - w * sin;
      nw = y * sin + w * cos;
      y = ny; w = nw;
      
      // Rotate in ZW plane
      cos = Math.cos(angles.zw);
      sin = Math.sin(angles.zw);
      nz = z * cos - w * sin;
      nw = z * sin + w * cos;
      z = nz; w = nw;
      
      return [x, y, z, w];
    };

    // Project 4D to 3D
    const project4Dto3D = (point: number[]) => {
      const distance = 2;
      const [x, y, z, w] = point;
      const factor = distance / (distance - w);
      return [x * factor, y * factor, z * factor];
    };

    // Project 3D to 2D
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

    // Draw tesseract
    const drawTesseract = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = Math.min(canvas.width, canvas.height) * 0.2;

      // Smooth rotation based on mouse position
      const targetXY = mouseRef.current.x * 0.3;
      const targetXZ = mouseRef.current.y * 0.3;
      const targetXW = mouseRef.current.x * 0.2;
      
      rotationRef.current.xy += (targetXY - rotationRef.current.xy) * 0.05;
      rotationRef.current.xz += (targetXZ - rotationRef.current.xz) * 0.05;
      rotationRef.current.xw += (targetXW - rotationRef.current.xw) * 0.05;
      rotationRef.current.yz += 0.005;
      rotationRef.current.yw += 0.003;
      rotationRef.current.zw += 0.002;

      // Define tesseract vertices (4D hypercube)
      const vertices4D = [];
      for (let i = 0; i < 16; i++) {
        vertices4D.push([
          (i & 1) ? 1 : -1,
          (i & 2) ? 1 : -1,
          (i & 4) ? 1 : -1,
          (i & 8) ? 1 : -1
        ]);
      }

      // Rotate and project vertices
      const projectedVertices = vertices4D.map(v => {
        const rotated = rotate4D(v, rotationRef.current);
        const proj3D = project4Dto3D(rotated);
        return project3Dto2D(proj3D, centerX, centerY, size);
      });

      // Define edges connecting vertices
      const edges = [];
      for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
          // Check if vertices differ by exactly one bit (connected in hypercube)
          const diff = i ^ j;
          if (diff && !(diff & (diff - 1))) {
            edges.push([i, j]);
          }
        }
      }

      // Sort edges by average depth
      const edgesWithDepth = edges.map(([a, b]) => {
        const avgZ = (projectedVertices[a][2] + projectedVertices[b][2]) / 2;
        return { edge: [a, b], depth: avgZ };
      });
      edgesWithDepth.sort((a, b) => a.depth - b.depth);

      // Draw edges with varying opacity based on depth
      edgesWithDepth.forEach(({ edge, depth }) => {
        const [a, b] = edge;
        const opacity = 0.2 + (depth + 1) * 0.15;
        
        ctx.beginPath();
        ctx.moveTo(projectedVertices[a][0], projectedVertices[a][1]);
        ctx.lineTo(projectedVertices[b][0], projectedVertices[b][1]);
        
        // Gradient color based on position in 4D space
        const color4D = (vertices4D[a][3] + 1) * 0.5;
        const red = 180 + color4D * 60;
        const green = 16 + color4D * 10;
        const blue = 48 + color4D * 15;
        
        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw vertices
      projectedVertices.forEach((v, idx) => {
        const [x, y, z] = v;
        const radius = Math.max(1, 3 + (z + 1) * 2);
        const opacity = Math.max(0.1, Math.min(0.7, 0.3 + (z + 1) * 0.2));
        
        // Color based on 4D W coordinate
        const color4D = (vertices4D[idx][3] + 1) * 0.5;
        const red = 200 + color4D * 40;
        const green = 18 + color4D * 10;
        const blue = 54 + color4D * 15;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        ctx.fill();
      });
    };

    // Animation loop
    const animate = () => {
      drawTesseract();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
