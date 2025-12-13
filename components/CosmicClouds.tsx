import React, { useEffect, useRef } from 'react';

interface Cube {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  glitchOffset: number;
  nextGlitch: number;
}

export default function CosmicClouds() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubesRef = useRef<Cube[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);

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

    // Initialize cubes - reduced count for performance
    const initCubes = () => {
      cubesRef.current = [];
      const cubeCount = Math.min(25, Math.floor((window.innerWidth * window.innerHeight) / 50000));
      
      for (let i = 0; i < cubeCount; i++) {
        cubesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 30 + 20,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.04,
          opacity: Math.random() * 0.4 + 0.3,
          glitchOffset: 0,
          nextGlitch: Date.now() + Math.random() * 2000
        });
      }
    };
    initCubes();

    // Mouse move handler with throttling
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }, 16); // ~60fps throttle
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Click handler - disperse cubes
    const handleClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      // Disperse all cubes from click point
      cubesRef.current.forEach((cube) => {
        const dx = cube.x - clickX;
        const dy = cube.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 500) {
          const force = (1 - distance / 500) * 15;
          cube.vx += (dx / distance) * force;
          cube.vy += (dy / distance) * force;
        }
      });
    };
    window.addEventListener('click', handleClick);

    // Draw cube with glitch effect
    const drawCube = (cube: Cube) => {
      ctx.save();
      ctx.translate(cube.x, cube.y);
      ctx.rotate(cube.rotation);
      
      const halfSize = cube.size / 2;
      
      // Glitch effect - random RGB channel offset
      if (Date.now() > cube.nextGlitch) {
        cube.glitchOffset = Math.random() * 4 - 2;
        cube.nextGlitch = Date.now() + Math.random() * 1000 + 500;
      }
      
      // Draw cube with glitch
      ctx.globalAlpha = cube.opacity;
      
      // Red channel offset
      ctx.fillStyle = '#FF3B30';
      ctx.fillRect(-halfSize + cube.glitchOffset, -halfSize, cube.size, cube.size);
      
      // Main cube
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(-halfSize, -halfSize, cube.size, cube.size);
      
      // Wireframe edges for tech look
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.globalAlpha = cube.opacity * 0.5;
      ctx.strokeRect(-halfSize, -halfSize, cube.size, cube.size);
      
      // Draw corner dots
      const dotSize = 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-halfSize - dotSize/2, -halfSize - dotSize/2, dotSize, dotSize);
      ctx.fillRect(halfSize - dotSize/2, -halfSize - dotSize/2, dotSize, dotSize);
      ctx.fillRect(-halfSize - dotSize/2, halfSize - dotSize/2, dotSize, dotSize);
      ctx.fillRect(halfSize - dotSize/2, halfSize - dotSize/2, dotSize, dotSize);
      
      ctx.restore();
    };

    // Animation loop with FPS limiting
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime.current;
      
      // Limit to 30 FPS for better performance
      if (deltaTime < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastFrameTime.current = currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw cubes
      cubesRef.current.forEach((cube) => {
        // Calculate distance from mouse
        const dx = mouseRef.current.x - cube.x;
        const dy = mouseRef.current.y - cube.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 250;

        // Apply mouse influence
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.8;
          cube.vx += (dx / distance) * force;
          cube.vy += (dy / distance) * force;
        }

        // Apply velocity damping
        cube.vx *= 0.92;
        cube.vy *= 0.92;

        // Update position
        cube.x += cube.vx;
        cube.y += cube.vy;
        
        // Update rotation
        cube.rotation += cube.rotationSpeed;

        // Wrap around screen edges
        if (cube.x < -cube.size) cube.x = canvas.width + cube.size;
        if (cube.x > canvas.width + cube.size) cube.x = -cube.size;
        if (cube.y < -cube.size) cube.y = canvas.height + cube.size;
        if (cube.y > canvas.height + cube.size) cube.y = -cube.size;

        drawCube(cube);
      });

      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearTimeout(mouseTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        opacity: 0.7
      }}
    />
  );
}
