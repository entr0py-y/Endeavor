'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getPerformanceEngine, PerformanceMetrics, DeviceCapabilities } from '@/lib/performanceEngine';

interface FPSMeterProps {
  className?: string;
  showTier?: boolean;
}

/**
 * Live FPS Meter Component
 * 
 * A minimal, editorial FPS counter that displays real-time rendering performance.
 * Positioned in the top-right, left of navigation elements.
 * 
 * Features:
 * - Smooth FPS display with rolling average
 * - Device tier indicator (optional)
 * - Subtle white glow
 * - Respects reduced motion preferences
 */
export default function FPSMeter({ className = '', showTier = false }: FPSMeterProps) {
  const [fps, setFps] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const engineRef = useRef<ReturnType<typeof getPerformanceEngine> | null>(null);
  const displayFPSRef = useRef<number>(0);
  const rafRef = useRef<number>();
  
  // Smooth FPS display update
  const updateDisplay = useCallback(() => {
    if (engineRef.current) {
      const metrics = engineRef.current.getMetrics();
      // Extra smoothing for display
      displayFPSRef.current += (metrics.displayFPS - displayFPSRef.current) * 0.2;
      setFps(Math.round(displayFPSRef.current));
    }
    rafRef.current = requestAnimationFrame(updateDisplay);
  }, []);
  
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(false);
      return;
    }
    
    // Initialize performance engine
    const engine = getPerformanceEngine();
    engineRef.current = engine;
    
    // Get device capabilities
    setCapabilities(engine.getCapabilities());
    
    // Start the engine if not already running
    engine.start();
    
    // Set initial FPS
    displayFPSRef.current = engine.getMetrics().targetFPS;
    setFps(Math.round(displayFPSRef.current));
    
    // Start smooth display updates
    rafRef.current = requestAnimationFrame(updateDisplay);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateDisplay]);
  
  // Don't render if accessibility mode or not visible
  if (!isVisible) {
    return null;
  }
  
  // Determine FPS color based on performance relative to target
  const getColor = () => {
    if (!engineRef.current) return 'rgba(255, 255, 255, 0.7)';
    const metrics = engineRef.current.getMetrics();
    const ratio = fps / metrics.targetFPS;
    
    if (ratio >= 0.95) return 'rgba(255, 255, 255, 0.85)';
    if (ratio >= 0.8) return 'rgba(255, 255, 200, 0.85)';
    return 'rgba(255, 200, 200, 0.85)';
  };
  
  // Get tier label
  const getTierLabel = () => {
    if (!capabilities) return '';
    const tierLabels = {
      low: 'ECO',
      medium: 'BAL',
      high: 'PRF',
    };
    return tierLabels[capabilities.tier];
  };
  
  return (
    <div
      className={`fixed z-[100] pointer-events-none select-none ${className}`}
      style={{
        top: '2.8rem',
        right: '11rem', // Position left of navigation
        fontFamily: '"Space Mono", monospace',
        fontSize: '11px',
        letterSpacing: '0.1em',
        fontWeight: 400,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
          color: getColor(),
          textShadow: '0 0 8px rgba(255, 255, 255, 0.3), 0 0 16px rgba(255, 255, 255, 0.15)',
          transition: 'color 0.3s ease',
        }}
      >
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            minWidth: '28px',
            textAlign: 'right',
          }}
        >
          {fps}
        </span>
        <span style={{ opacity: 0.5, fontSize: '9px' }}>FPS</span>
        {showTier && capabilities && (
          <span
            style={{
              opacity: 0.4,
              fontSize: '8px',
              marginLeft: '4px',
              letterSpacing: '0.15em',
            }}
          >
            {getTierLabel()}
          </span>
        )}
      </div>
    </div>
  );
}
