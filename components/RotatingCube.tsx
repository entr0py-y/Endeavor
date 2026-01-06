import React, { useEffect, useRef, useMemo } from 'react';

interface RotatingCubeProps {
  isInverted?: boolean;
}

export default function RotatingCube({ isInverted = false }: RotatingCubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 });
  const rotationRef = useRef({ xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0 });
  const animationRef = useRef<number>();
  const isInvertedRef = useRef(isInverted);
  const pulseRef = useRef(0);
  const clickWaveRef = useRef<{ x: number; y: number; time: number; active: boolean }>({ x: 0, y: 0, time: 0, active: false });

  // Update ref when prop changes
  useEffect(() => {
    isInvertedRef.current = isInverted;
  }, [isInverted]);

  // Pre-calculate vertices and edges for outer and inner tesseract
  const { outerVertices4D, innerVertices4D, outerEdges, innerEdges, diagonalEdges } = useMemo(() => {
    const outerVerts: number[][] = [];
    const innerVerts: number[][] = [];

    // Outer tesseract (larger)
    for (let i = 0; i < 16; i++) {
      outerVerts.push([
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      ]);
    }

    // Inner tesseract (smaller, 40% scale)
    for (let i = 0; i < 16; i++) {
      innerVerts.push([
        ((i & 1) ? 1 : -1) * 0.4,
        ((i & 2) ? 1 : -1) * 0.4,
        ((i & 4) ? 1 : -1) * 0.4,
        ((i & 8) ? 1 : -1) * 0.4
      ]);
    }

    const outerEdgeList: number[][] = [];
    const innerEdgeList: number[][] = [];
    const diagonalEdgeList: number[][] = [];

    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if (diff && !(diff & (diff - 1))) {
          outerEdgeList.push([i, j]);
          innerEdgeList.push([i, j]);
        }
      }
      // Connect outer to inner at each vertex
      diagonalEdgeList.push([i, i]);
    }

    return {
      outerVertices4D: outerVerts,
      innerVertices4D: innerVerts,
      outerEdges: outerEdgeList,
      innerEdges: innerEdgeList,
      diagonalEdges: diagonalEdgeList
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Throttled mouse handler with velocity tracking
    let lastMouseUpdate = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseUpdate < 16) return;
      lastMouseUpdate = now;

      const newX = (e.clientX / width) * 2 - 1;
      const newY = (e.clientY / height) * 2 - 1;

      // Calculate velocity
      mouseRef.current.vx = (newX - mouseRef.current.x) * 10;
      mouseRef.current.vy = (newY - mouseRef.current.y) * 10;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = newX;
      mouseRef.current.y = newY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Click handler for wave effect
    const handleClick = (e: MouseEvent) => {
      clickWaveRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
        active: true
      };
    };
    window.addEventListener('click', handleClick);

    // Pre-allocate arrays for performance
    const outerProjected: number[][] = new Array(16).fill(null).map(() => [0, 0, 0]);
    const innerProjected: number[][] = new Array(16).fill(null).map(() => [0, 0, 0]);

    // Optimized 4D rotation + projection
    const rotate4DAndProject = (
      v: number[],
      centerX: number,
      centerY: number,
      scale: number,
      output: number[]
    ) => {
      let x = v[0], y = v[1], z = v[2], w = v[3];
      const angles = rotationRef.current;

      // XY rotation
      let cos = Math.cos(angles.xy), sin = Math.sin(angles.xy);
      let nx = x * cos - y * sin, ny = x * sin + y * cos;
      x = nx; y = ny;

      // XZ rotation
      cos = Math.cos(angles.xz); sin = Math.sin(angles.xz);
      nx = x * cos - z * sin;
      let nz = x * sin + z * cos;
      x = nx; z = nz;

      // XW rotation
      cos = Math.cos(angles.xw); sin = Math.sin(angles.xw);
      nx = x * cos - w * sin;
      let nw = x * sin + w * cos;
      x = nx; w = nw;

      // YZ rotation
      cos = Math.cos(angles.yz); sin = Math.sin(angles.yz);
      ny = y * cos - z * sin;
      nz = y * sin + z * cos;
      y = ny; z = nz;

      // YW rotation
      cos = Math.cos(angles.yw); sin = Math.sin(angles.yw);
      ny = y * cos - w * sin;
      nw = y * sin + w * cos;
      y = ny; w = nw;

      // ZW rotation
      cos = Math.cos(angles.zw); sin = Math.sin(angles.zw);
      nz = z * cos - w * sin;
      z = nz; w = nw;

      // Project 4D to 3D
      const factor4D = 2 / (2 - w);
      const px = x * factor4D, py = y * factor4D, pz = z * factor4D;

      // Project 3D to 2D
      const factor3D = 3 / (3 - pz);
      output[0] = centerX + px * factor3D * scale;
      output[1] = centerY + py * factor3D * scale;
      output[2] = pz;
    };

    let lastFrame = 0;
    const targetFrameTime = 1000 / 60;

    // Lerp function and transition state
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let transitionProgress = isInvertedRef.current ? 1 : 0;
    const transitionSpeed = 0.03;

    const drawTesseract = (timestamp: number) => {
      const deltaTime = timestamp - lastFrame;
      if (deltaTime < targetFrameTime * 0.9) {
        animationRef.current = requestAnimationFrame(drawTesseract);
        return;
      }
      lastFrame = timestamp;

      // Update pulse
      pulseRef.current = (pulseRef.current + 0.02) % (Math.PI * 2);
      const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5;

      // Check click wave
      const wave = clickWaveRef.current;
      let waveRadius = 0;
      let waveIntensity = 0;
      if (wave.active) {
        const waveAge = (timestamp - wave.time) / 1000;
        waveRadius = waveAge * 600;
        waveIntensity = Math.max(0, 1 - waveAge * 1.5);
        if (waveIntensity <= 0) wave.active = false;
      }

      // Smooth theme transition
      const targetProgress = isInvertedRef.current ? 1 : 0;
      transitionProgress += (targetProgress - transitionProgress) * transitionSpeed;
      const progress = transitionProgress;

      const colorValue = Math.round(lerp(255, 0, progress));
      const accentColor = { r: 100, g: 200, b: 255 }; // Cyan accent

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseSize = Math.min(width, height) * 0.22;
      const size = baseSize * (1 + pulse * 0.05); // Subtle breathing

      // Mouse velocity affects rotation speed
      const mouse = mouseRef.current;
      const velocityFactor = Math.min(1, Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy));

      // Smooth rotation updates with velocity influence
      const rot = rotationRef.current;
      const baseSpeed = 0.003;
      const interactiveSpeed = 0.008 + velocityFactor * 0.02;

      rot.xy += (mouse.x * 0.5 - rot.xy) * 0.08 + baseSpeed;
      rot.xz += (mouse.y * 0.5 - rot.xz) * 0.08 + baseSpeed * 0.8;
      rot.xw += (mouse.x * 0.3 - rot.xw) * 0.06 + interactiveSpeed;
      rot.yz += 0.006 + velocityFactor * 0.01;
      rot.yw += 0.004 + velocityFactor * 0.008;
      rot.zw += 0.003 + velocityFactor * 0.006;

      // Decay velocity
      mouse.vx *= 0.95;
      mouse.vy *= 0.95;

      // Project all vertices - outer
      for (let i = 0; i < 16; i++) {
        rotate4DAndProject(outerVertices4D[i], centerX, centerY, size, outerProjected[i]);
      }

      // Project all vertices - inner
      for (let i = 0; i < 16; i++) {
        rotate4DAndProject(innerVertices4D[i], centerX, centerY, size, innerProjected[i]);
      }

      // Draw diagonal connections (outer to inner) - ghostly
      ctx.lineWidth = 0.5;
      for (let i = 0; i < diagonalEdges.length; i++) {
        const [a, b] = diagonalEdges[i];
        const opacity = 0.08 + pulse * 0.05;
        ctx.strokeStyle = `rgba(${colorValue},${colorValue},${colorValue},${opacity})`;
        ctx.beginPath();
        ctx.moveTo(outerProjected[a][0], outerProjected[a][1]);
        ctx.lineTo(innerProjected[b][0], innerProjected[b][1]);
        ctx.stroke();
      }

      // Draw inner tesseract edges
      ctx.lineWidth = 1;
      for (let i = 0; i < innerEdges.length; i++) {
        const [a, b] = innerEdges[i];
        const avgZ = (innerProjected[a][2] + innerProjected[b][2]) / 2;
        const opacity = 0.15 + (avgZ + 1) * 0.1 + pulse * 0.1;

        // Subtle cyan tint for inner
        const r = Math.round(lerp(accentColor.r, 0, progress));
        const g = Math.round(lerp(accentColor.g, 0, progress));
        const b_val = Math.round(lerp(accentColor.b, 0, progress));
        ctx.strokeStyle = `rgba(${r},${g},${b_val},${opacity * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(innerProjected[a][0], innerProjected[a][1]);
        ctx.lineTo(innerProjected[b][0], innerProjected[b][1]);
        ctx.stroke();
      }

      // Draw outer tesseract edges
      ctx.lineWidth = 2;
      for (let i = 0; i < outerEdges.length; i++) {
        const [a, b] = outerEdges[i];
        const avgZ = (outerProjected[a][2] + outerProjected[b][2]) / 2;
        let opacity = 0.2 + (avgZ + 1) * 0.15;

        // Click wave effect on edges
        if (wave.active) {
          const midX = (outerProjected[a][0] + outerProjected[b][0]) / 2;
          const midY = (outerProjected[a][1] + outerProjected[b][1]) / 2;
          const distToWave = Math.abs(Math.sqrt((midX - wave.x) ** 2 + (midY - wave.y) ** 2) - waveRadius);
          if (distToWave < 50) {
            opacity += waveIntensity * (1 - distToWave / 50) * 0.5;
          }
        }

        ctx.strokeStyle = `rgba(${colorValue},${colorValue},${colorValue},${opacity})`;
        ctx.beginPath();
        ctx.moveTo(outerProjected[a][0], outerProjected[a][1]);
        ctx.lineTo(outerProjected[b][0], outerProjected[b][1]);
        ctx.stroke();
      }

      // Draw outer vertices with glow
      for (let i = 0; i < 16; i++) {
        const [x, y, z] = outerProjected[i];
        const baseRadius = Math.max(2, 4 + (z + 1) * 2);
        const radius = baseRadius * (1 + pulse * 0.2);
        let opacity = Math.max(0.15, Math.min(0.8, 0.35 + (z + 1) * 0.2));

        // Click wave effect on vertices
        if (wave.active) {
          const distToWave = Math.abs(Math.sqrt((x - wave.x) ** 2 + (y - wave.y) ** 2) - waveRadius);
          if (distToWave < 60) {
            opacity = Math.min(1, opacity + waveIntensity * (1 - distToWave / 60) * 0.6);
          }
        }

        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, `rgba(${colorValue},${colorValue},${colorValue},${opacity})`);
        gradient.addColorStop(0.5, `rgba(${colorValue},${colorValue},${colorValue},${opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${colorValue},${colorValue},${colorValue},0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Solid center
        ctx.fillStyle = `rgba(${colorValue},${colorValue},${colorValue},${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw inner vertices (smaller, accent colored)
      for (let i = 0; i < 16; i++) {
        const [x, y, z] = innerProjected[i];
        const radius = Math.max(1, 2 + (z + 1) * 1);
        const opacity = Math.max(0.1, Math.min(0.5, 0.25 + (z + 1) * 0.15)) * (0.7 + pulse * 0.3);

        const r = Math.round(lerp(accentColor.r, 50, progress));
        const g = Math.round(lerp(accentColor.g, 50, progress));
        const b_val = Math.round(lerp(accentColor.b, 50, progress));

        ctx.fillStyle = `rgba(${r},${g},${b_val},${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw coordinate labels on front vertices only (cleaner)
      for (let i = 0; i < 16; i++) {
        const [x, y, z] = outerProjected[i];
        if (z > 0.3) { // Only front-facing vertices
          const fontSize = Math.max(7, 9 + z * 2);
          ctx.font = `${fontSize}px "Space Mono", monospace`;
          const greyVal = Math.round(lerp(60, 180, progress));
          ctx.fillStyle = `rgba(${greyVal}, ${greyVal}, ${greyVal}, 0.5)`;
          ctx.fillText(`[${Math.round(x)},${Math.round(y)}]`, x + 8, y + 3);
        }
      }

      animationRef.current = requestAnimationFrame(drawTesseract);
    };

    animationRef.current = requestAnimationFrame(drawTesseract);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [outerVertices4D, innerVertices4D, outerEdges, innerEdges, diagonalEdges]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: 'transform' }}
    />
  );
}
