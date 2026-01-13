'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getPerformanceEngine, PerformanceEngine, PerformanceMetrics } from '@/lib/performanceEngine';

interface UseAdaptiveFrameOptions {
  onFrame?: (deltaTime: number, metrics: PerformanceMetrics) => void;
  enabled?: boolean;
}

/**
 * React hook for adaptive frame-rate rendering
 * 
 * Provides a device-aware animation frame callback that respects
 * the performance engine's FPS targets and throttling.
 * 
 * @param options.onFrame - Callback executed each rendered frame
 * @param options.enabled - Whether the frame loop is active
 * 
 * @returns Object with control methods and current metrics
 */
export function useAdaptiveFrame(options: UseAdaptiveFrameOptions = {}) {
  const { onFrame, enabled = true } = options;
  const engineRef = useRef<PerformanceEngine | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const isActiveRef = useRef(enabled);
  
  // Update active state
  useEffect(() => {
    isActiveRef.current = enabled;
  }, [enabled]);
  
  // Setup engine and frame callback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get or create engine
    const engine = getPerformanceEngine();
    engineRef.current = engine;
    
    // Start the engine
    engine.start();
    
    // Subscribe to frame updates if callback provided
    if (onFrame) {
      unsubscribeRef.current = engine.onFrame((deltaTime, metrics) => {
        if (!isActiveRef.current) return;
        
        // Check if we should render this frame based on our local timing
        const now = performance.now();
        const targetFrameTime = engine.getTargetFrameTime();
        
        if (now - lastRenderTimeRef.current >= targetFrameTime * 0.9) {
          onFrame(deltaTime, metrics);
          lastRenderTimeRef.current = now;
        }
      });
    }
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [onFrame]);
  
  // Get current metrics
  const getMetrics = useCallback(() => {
    return engineRef.current?.getMetrics() || null;
  }, []);
  
  // Get current capabilities
  const getCapabilities = useCallback(() => {
    return engineRef.current?.getCapabilities() || null;
  }, []);
  
  // Check if frame should render (for manual control)
  const shouldRenderFrame = useCallback(() => {
    if (!engineRef.current) return true;
    return engineRef.current.shouldRenderFrame(lastRenderTimeRef.current);
  }, []);
  
  // Mark frame as rendered (for manual control)
  const markFrameRendered = useCallback(() => {
    lastRenderTimeRef.current = performance.now();
  }, []);
  
  return {
    getMetrics,
    getCapabilities,
    shouldRenderFrame,
    markFrameRendered,
    engine: engineRef.current,
  };
}

/**
 * React hook for frame-time aware canvas animations
 * 
 * Provides a ref callback for canvas elements that automatically
 * integrates with the performance engine.
 * 
 * @param draw - Drawing function called each frame
 * @param options - Configuration options
 */
export function useAdaptiveCanvas(
  draw: (ctx: CanvasRenderingContext2D, deltaTime: number, metrics: PerformanceMetrics) => void,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const handleFrame = useCallback((deltaTime: number, metrics: PerformanceMetrics) => {
    if (!ctxRef.current || !canvasRef.current) return;
    draw(ctxRef.current, deltaTime, metrics);
  }, [draw]);
  
  useAdaptiveFrame({
    onFrame: handleFrame,
    enabled,
  });
  
  // Canvas ref callback
  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (canvas) {
      ctxRef.current = canvas.getContext('2d');
    } else {
      ctxRef.current = null;
    }
  }, []);
  
  return setCanvasRef;
}

export default useAdaptiveFrame;
