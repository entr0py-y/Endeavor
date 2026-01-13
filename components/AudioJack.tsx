'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

// Configuration
const CONFIG = {
  // Socket position (right side, aligned with wave)
  socket: {
    offsetRight: 40,
    offsetBottom: 40,
    radius: 14,
    glowRadius: 22,
    snapDistance: 45,
  },
  // Jack design (horizontal 3.5mm plug)
  jack: {
    bodyLength: 45, // Main body length
    bodyWidth: 12, // Body thickness
    tipLength: 18, // Pointed tip length
    tipWidth: 6, // Tip thickness
    ringWidth: 3, // Ring segment width
    glowIntensity: 0.7,
  },
  // Wire design
  wire: {
    segments: 30, // Smooth curve
    sagAmount: 40, // Curve sag when relaxed
    restLength: 60, // Short wire at rest
  },
  // Sparkle effect
  sparkle: {
    count: 8,
    duration: 400,
    radius: 25,
    particleSize: 3,
  },
  // Animation
  animation: {
    snapDuration: 300,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
};

interface Point {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

interface AudioJackProps {
  onPlugChange: (isPlugged: boolean) => void;
  isPlaying: boolean;
  currentSection?: number;
}

export default function AudioJack({ onPlugChange, isPlaying, currentSection = 0 }: AudioJackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const wirePointsRef = useRef<Point[]>([]);
  const sparklesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; opacity: number }[]>([]);
  const moveAnimationRef = useRef<number>();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPluggingIn, setIsPluggingIn] = useState(false); // Track direction of animation
  const [isPlugged, setIsPlugged] = useState(false);
  const [jackPos, setJackPos] = useState<Point>({ x: 0, y: 0 });
  const [socketPos, setSocketPos] = useState<Point>({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showHint, setShowHint] = useState(true); // For smooth fade out

  // Rest position for the jack (bottom-left area)
  const restPosRef = useRef<Point>({ x: 100, y: 0 });

  // Initialize positions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    const updatePositions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Socket at music wave x-axis (right: 3.5rem = 56px) and jack initiation y-axis
      const socket = {
        x: width - 56, // Aligned with AudioWave (right: 3.5rem)
        y: height - 60, // Same y as jack anchor/initiation point
      };
      setSocketPos(socket);


      // Jack rest position shifted to the right
      const rest = {
        x: 180, // Slightly right from previous (was 160)
        y: height - 60,
      };
      restPosRef.current = rest;

      if (!isPlugged) {
        setJackPos(rest);
      } else {
        setJackPos(socket);
      }

      // Initialize wire points
      initializeWire(rest, rest);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [isPlugged]);

  // Initialize wire points
  const initializeWire = useCallback((start: Point, end: Point) => {
    const points: Point[] = [];
    for (let i = 0; i <= CONFIG.wire.segments; i++) {
      const t = i / CONFIG.wire.segments;
      points.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        vx: 0,
        vy: 0,
      });
    }
    wirePointsRef.current = points;
  }, []);

  // Update wire - clean smooth curve that stretches
  const updateWire = useCallback((jackPosition: Point) => {
    const points = wirePointsRef.current;
    if (points.length === 0) return;

    // Anchor at the pin's rest position (where pin starts)
    const anchorPos = { x: restPosRef.current.x - (CONFIG.jack.bodyLength + CONFIG.jack.tipLength), y: restPosRef.current.y };

    // Jack end point (left side of horizontal jack body)
    const totalJackLength = CONFIG.jack.bodyLength + CONFIG.jack.tipLength;
    const jackEnd = {
      x: jackPosition.x - totalJackLength,
      y: jackPosition.y,
    };

    // Calculate distance for sag amount
    const dx = jackEnd.x - anchorPos.x;
    const dy = jackEnd.y - anchorPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Sag decreases as wire stretches (tighter when pulled)
    const stretchRatio = distance / CONFIG.wire.restLength;
    const sag = CONFIG.wire.sagAmount / Math.max(1, stretchRatio * 0.5);

    // Generate smooth curve points from anchor to jack
    for (let i = 0; i <= CONFIG.wire.segments; i++) {
      const t = i / CONFIG.wire.segments;
      
      // Linear interpolation
      const x = anchorPos.x + (jackEnd.x - anchorPos.x) * t;
      const y = anchorPos.y + (jackEnd.y - anchorPos.y) * t;
      
      // Add natural sag curve (parabola)
      const sagOffset = Math.sin(t * Math.PI) * sag;
      
      points[i].x = x;
      points[i].y = y + sagOffset;
    }
  }, []);

  // Trigger sparkle effect
  const triggerSparkle = useCallback((x: number, y: number) => {
    const sparkles: typeof sparklesRef.current = [];
    for (let i = 0; i < CONFIG.sparkle.count; i++) {
      const angle = (i / CONFIG.sparkle.count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 0.5 + Math.random() * 1;
      sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: CONFIG.sparkle.duration,
        opacity: 0.8 + Math.random() * 0.2,
      });
    }
    sparklesRef.current = sparkles;
  }, []);

  // Handle click on jack - animate to socket or back
  const handleJackClick = useCallback(() => {
    if (isAnimating) return;

    const startPos = { ...jackPos };
    const targetPos = isPlugged ? restPosRef.current : socketPos;
    const duration = 800; // ms (2x slower)
    const startTime = performance.now();
    
    // Track if we're plugging in or unplugging
    const pluggingIn = !isPlugged;
    setIsPluggingIn(pluggingIn);
    setIsAnimating(true);
    
    // Hide hint when plugging in (will fade out smoothly)
    // Show hint when unplugging (will fade in smoothly)
    if (pluggingIn) {
      setShowHint(false);
    } else {
      // Turn off music immediately when unplugging
      onPlugChange(false);
      // Start fading in the hint
      setShowHint(true);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const newX = startPos.x + (targetPos.x - startPos.x) * eased;
      const newY = startPos.y + (targetPos.y - startPos.y) * eased;

      setJackPos({ x: newX, y: newY });

      if (progress < 1) {
        moveAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setIsAnimating(false);
        setIsPluggingIn(false);
        const newPlugged = !isPlugged;
        setIsPlugged(newPlugged);
        
        // Only call onPlugChange when plugging IN (unplugging already called it immediately)
        if (newPlugged) {
          onPlugChange(true);
        }
        
        if (newPlugged) {
          // Play plug-in sound
          const plugSound = new Audio('/audio/click-10.mp3');
          plugSound.volume = 0.5;
          plugSound.play().catch(() => {});
          
          triggerSparkle(socketPos.x, socketPos.y);
        }
      }
    };

    moveAnimationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, isPlugged, jackPos, socketPos, onPlugChange, triggerSparkle]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (moveAnimationRef.current) {
        cancelAnimationFrame(moveAnimationRef.current);
      }
    };
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      // Update wire physics
      updateWire(jackPos);

      // Draw wire only when plugging in or already plugged (not when unplugging)
      if (isPlugged || (isAnimating && isPluggingIn)) {
        drawWire(ctx);
      }

      // Draw socket
      drawSocket(ctx);

      // Draw jack
      drawJack(ctx, jackPos);

      // Update and draw sparkles
      updateSparkles();
      drawSparkles(ctx);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [jackPos, socketPos, isPlugged, isAnimating, isPluggingIn, updateWire]);

  // Draw wire with smooth curve
  const drawWire = (ctx: CanvasRenderingContext2D) => {
    const points = wirePointsRef.current;
    if (points.length < 2) return;

    ctx.save();

    // Wire glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // Draw smooth curve through points
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    // Final point
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);

    ctx.stroke();
    ctx.restore();
  };

  // Draw socket
  const drawSocket = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // Outer glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = CONFIG.socket.glowRadius;

    // Socket ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(socketPos.x, socketPos.y, CONFIG.socket.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner hole
    ctx.fillStyle = isPlugged ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(socketPos.x, socketPos.y, CONFIG.socket.radius - 4, 0, Math.PI * 2);
    ctx.fill();

    // Connection indicator glow when plugged
    if (isPlugged) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(socketPos.x, socketPos.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Draw jack (horizontal 3.5mm plug pointing right) - full white
  const drawJack = (ctx: CanvasRenderingContext2D, pos: Point) => {
    ctx.save();

    const { bodyLength, bodyWidth, tipLength, tipWidth, glowIntensity } = CONFIG.jack;
    const totalLength = bodyLength + tipLength;

    // Glow
    ctx.shadowColor = `rgba(255, 255, 255, ${glowIntensity})`;
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

    // === PLUG BODY (left side - grip area) ===
    ctx.beginPath();
    ctx.roundRect(
      pos.x - totalLength,
      pos.y - bodyWidth / 2,
      bodyLength,
      bodyWidth,
      3
    );
    ctx.fill();

    // === TIP - narrower pointed section ===
    ctx.beginPath();
    ctx.roundRect(
      pos.x - tipLength,
      pos.y - tipWidth / 2,
      tipLength - 4,
      tipWidth,
      1
    );
    ctx.fill();

    // Pointed end
    ctx.beginPath();
    ctx.moveTo(pos.x - 4, pos.y - tipWidth / 2);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineTo(pos.x - 4, pos.y + tipWidth / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Update sparkles
  const updateSparkles = () => {
    sparklesRef.current = sparklesRef.current
      .map(s => ({
        ...s,
        x: s.x + s.vx,
        y: s.y + s.vy,
        life: s.life - 16,
        opacity: s.opacity * 0.95,
      }))
      .filter(s => s.life > 0);
  };

  // Draw sparkles
  const drawSparkles = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    sparklesRef.current.forEach(s => {
      ctx.shadowColor = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.shadowBlur = 6;
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, CONFIG.sparkle.particleSize * (s.life / CONFIG.sparkle.duration), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Curved arrow hint pointing to pin - smooth fade out */}
      <div
        className="absolute pointer-events-none transition-opacity duration-700 ease-out"
        style={{
          left: jackPos.x - (CONFIG.jack.bodyLength + CONFIG.jack.tipLength),
          top: jackPos.y - 90,
          opacity: (!isPlugged && !isAnimating && currentSection === 0 && showHint) ? 1 : 0,
        }}
      >
          {/* Curved arrow SVG with glow */}
          <svg
            width="100"
            height="70"
            viewBox="0 0 100 70"
            fill="none"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 0 15px rgba(255,255,255,0.5))',
            }}
          >
            {/* Curved arrow path - starts from text, curves down to pin */}
            <path
              d="M50 10 C 30 10, 20 30, 25 55"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Arrow head pointing down to pin */}
            <path
              d="M18 50 L25 58 L32 50"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Text label with Space Mono font - two lines - shifted right and up */}
          <div
            className="absolute"
            style={{
              top: '-14px',
              left: '65px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
              letterSpacing: '0.05em',
              lineHeight: '1.4',
            }}
          >
            <div>Click to turn on music</div>
            <div>(recommended)</div>
          </div>
        </div>
      
      {/* Clickable area for jack (horizontal) */}
      <div
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          left: jackPos.x - (CONFIG.jack.bodyLength + CONFIG.jack.tipLength) - 10,
          top: jackPos.y - CONFIG.jack.bodyWidth / 2 - 10,
          width: CONFIG.jack.bodyLength + CONFIG.jack.tipLength + 20,
          height: CONFIG.jack.bodyWidth + 20,
          touchAction: 'none',
        }}
        onClick={handleJackClick}
      />
    </div>
  );
}
