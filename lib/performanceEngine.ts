/**
 * Adaptive Performance Engine
 * 
 * A device-aware rendering system that maximizes smoothness on high-end devices
 * while protecting low-end devices from overload.
 * 
 * Features:
 * - Device capability detection (CPU, GPU, RAM, refresh rate)
 * - Per-device FPS targeting with intelligent limits
 * - Dynamic FPS adjustment based on real-time performance
 * - Smooth frame skipping without visual artifacts
 * - Thermal and battery safety considerations
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DeviceTier = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  tier: DeviceTier;
  cpuCores: number;
  memoryGB: number | null;
  gpuTier: 'low' | 'medium' | 'high' | 'unknown';
  gpuRenderer: string;
  maxRefreshRate: number;
  isMobile: boolean;
  prefersReducedMotion: boolean;
}

export interface FPSConfig {
  // Target FPS per tier
  targets: {
    low: { min: number; max: number; initial: number };
    medium: { min: number; max: number; initial: number };
    high: { min: number; max: number; initial: number };
  };
  // Adjustment parameters
  adjustmentInterval: number;      // ms between FPS target adjustments
  adjustmentStep: number;          // FPS change per adjustment
  dropThreshold: number;           // Frame time variance threshold for downgrade
  stabilityThreshold: number;      // Consecutive stable frames before upgrade
  rollingWindowSize: number;       // Frames to track for averaging
  smoothingFactor: number;         // Display FPS smoothing (0-1)
}

export interface PerformanceMetrics {
  currentFPS: number;
  displayFPS: number;              // Smoothed FPS for display
  targetFPS: number;
  frameTime: number;               // Current frame time in ms
  avgFrameTime: number;            // Average frame time
  droppedFrames: number;           // Frames dropped in current window
  deviceTier: DeviceTier;
  isThrottling: boolean;
  thermalState: 'nominal' | 'fair' | 'serious' | 'critical';
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: FPSConfig = {
  targets: {
    low: { min: 24, max: 40, initial: 30 },
    medium: { min: 30, max: 60, initial: 50 },
    high: { min: 60, max: 144, initial: 90 },
  },
  adjustmentInterval: 2000,
  adjustmentStep: 5,
  dropThreshold: 0.15,             // 15% frame time variance
  stabilityThreshold: 60,          // ~1 second of stable frames
  rollingWindowSize: 30,           // ~0.5 seconds at 60fps
  smoothingFactor: 0.15,           // Smooth FPS display changes
};

// ============================================================================
// GPU DETECTION PATTERNS
// ============================================================================

const GPU_TIERS = {
  high: [
    /nvidia.*rtx/i,
    /nvidia.*gtx\s*(16|20|30|40)/i,
    /radeon.*rx\s*(5[6-9]|6[0-9]|7[0-9])/i,
    /apple.*m[1-9]/i,
    /apple.*a1[4-9]/i,
    /mali-g7[1-9]/i,
    /adreno.*[6-7]\d{2}/i,
  ],
  medium: [
    /nvidia.*gtx\s*(9|10)/i,
    /radeon.*rx\s*(4|5[0-5])/i,
    /intel.*iris/i,
    /intel.*uhd.*[7-9]/i,
    /mali-g[5-6]/i,
    /adreno.*[5]\d{2}/i,
    /apple.*a1[0-3]/i,
  ],
  low: [
    /intel.*hd/i,
    /intel.*uhd.*[1-6]/i,
    /mali-[t4]/i,
    /adreno.*[1-4]\d{2}/i,
    /powervr/i,
    /swiftshader/i,
    /llvmpipe/i,
  ],
};

// ============================================================================
// DEVICE CAPABILITY DETECTION
// ============================================================================

export function detectDeviceCapabilities(): DeviceCapabilities {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  
  // CPU cores
  const cpuCores = nav?.hardwareConcurrency || 4;
  
  // Memory (Chrome/Edge only)
  const memoryGB = (nav as any)?.deviceMemory || null;
  
  // Mobile detection
  const isMobile = typeof window !== 'undefined' && (
    /iPhone|iPad|iPod|Android/i.test(nav?.userAgent || '') ||
    window.innerWidth < 768 ||
    'ontouchstart' in window
  );
  
  // Reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // GPU detection via WebGL
  let gpuRenderer = 'unknown';
  let gpuTier: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
  
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
        }
      }
    } catch (e) {
      // WebGL not available
    }
    
    // Classify GPU
    for (const pattern of GPU_TIERS.high) {
      if (pattern.test(gpuRenderer)) {
        gpuTier = 'high';
        break;
      }
    }
    if (gpuTier === 'unknown') {
      for (const pattern of GPU_TIERS.medium) {
        if (pattern.test(gpuRenderer)) {
          gpuTier = 'medium';
          break;
        }
      }
    }
    if (gpuTier === 'unknown') {
      for (const pattern of GPU_TIERS.low) {
        if (pattern.test(gpuRenderer)) {
          gpuTier = 'low';
          break;
        }
      }
    }
  }
  
  // Screen refresh rate detection
  let maxRefreshRate = 60;
  if (typeof window !== 'undefined' && 'screen' in window) {
    // Some browsers expose this
    const screen = window.screen as any;
    if (screen.refreshRate) {
      maxRefreshRate = screen.refreshRate;
    } else {
      // Estimate based on device type
      if (!isMobile && gpuTier === 'high') {
        maxRefreshRate = 144;
      } else if (!isMobile && gpuTier === 'medium') {
        maxRefreshRate = 120;
      } else if (isMobile) {
        maxRefreshRate = 60; // Most mobile screens
      }
    }
  }
  
  // Calculate overall device tier
  let tier: DeviceTier = 'medium';
  
  // Scoring system
  let score = 0;
  
  // CPU scoring (0-3)
  if (cpuCores >= 8) score += 3;
  else if (cpuCores >= 4) score += 2;
  else if (cpuCores >= 2) score += 1;
  
  // Memory scoring (0-3)
  if (memoryGB !== null) {
    if (memoryGB >= 8) score += 3;
    else if (memoryGB >= 4) score += 2;
    else if (memoryGB >= 2) score += 1;
  } else {
    score += 1.5; // Unknown, assume medium
  }
  
  // GPU scoring (0-3)
  if (gpuTier === 'high') score += 3;
  else if (gpuTier === 'medium') score += 2;
  else if (gpuTier === 'low') score += 0.5;
  else score += 1.5; // Unknown
  
  // Mobile penalty
  if (isMobile) score -= 1.5;
  
  // Determine tier
  if (score >= 7) tier = 'high';
  else if (score >= 4) tier = 'medium';
  else tier = 'low';
  
  // Override for reduced motion preference
  if (prefersReducedMotion) {
    tier = 'low';
  }
  
  return {
    tier,
    cpuCores,
    memoryGB,
    gpuTier,
    gpuRenderer,
    maxRefreshRate,
    isMobile,
    prefersReducedMotion,
  };
}

// ============================================================================
// PERFORMANCE ENGINE CLASS
// ============================================================================

export class PerformanceEngine {
  private config: FPSConfig;
  private capabilities: DeviceCapabilities;
  private metrics: PerformanceMetrics;
  
  // Frame timing
  private lastFrameTime: number = 0;
  private frameTimes: number[] = [];
  private frameCount: number = 0;
  private droppedFrameCount: number = 0;
  
  // Adaptive control
  private targetFPS: number;
  private currentTargetFrameTime: number;
  private lastAdjustmentTime: number = 0;
  private stableFrameCount: number = 0;
  private isRunning: boolean = false;
  
  // Callbacks
  private frameCallbacks: Set<(deltaTime: number, metrics: PerformanceMetrics) => void> = new Set();
  private metricsCallbacks: Set<(metrics: PerformanceMetrics) => void> = new Set();
  
  // Animation frame ID
  private rafId: number | null = null;
  
  // Thermal monitoring (if available)
  private thermalState: 'nominal' | 'fair' | 'serious' | 'critical' = 'nominal';
  
  constructor(customConfig?: Partial<FPSConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.capabilities = detectDeviceCapabilities();
    
    // Set initial target FPS based on device tier
    const tierConfig = this.config.targets[this.capabilities.tier];
    this.targetFPS = Math.min(tierConfig.initial, this.capabilities.maxRefreshRate);
    this.currentTargetFrameTime = 1000 / this.targetFPS;
    
    this.metrics = {
      currentFPS: this.targetFPS,
      displayFPS: this.targetFPS,
      targetFPS: this.targetFPS,
      frameTime: this.currentTargetFrameTime,
      avgFrameTime: this.currentTargetFrameTime,
      droppedFrames: 0,
      deviceTier: this.capabilities.tier,
      isThrottling: false,
      thermalState: 'nominal',
    };
    
    // Setup thermal monitoring if available
    this.setupThermalMonitoring();
    
    console.log(`[PerformanceEngine] Initialized - Tier: ${this.capabilities.tier}, Target FPS: ${this.targetFPS}, GPU: ${this.capabilities.gpuRenderer}`);
  }
  
  // ---------------------------------------------------------------------------
  // THERMAL MONITORING
  // ---------------------------------------------------------------------------
  
  private setupThermalMonitoring(): void {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        // Monitor charging state - throttle more when on battery
        if (!battery.charging && this.capabilities.isMobile) {
          const tierConfig = this.config.targets[this.capabilities.tier];
          this.targetFPS = Math.max(tierConfig.min, this.targetFPS - 10);
        }
      }).catch(() => {});
    }
  }
  
  // ---------------------------------------------------------------------------
  // FRAME LOOP
  // ---------------------------------------------------------------------------
  
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastAdjustmentTime = this.lastFrameTime;
    this.tick(this.lastFrameTime);
  }
  
  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  private tick = (currentTime: number): void => {
    if (!this.isRunning) return;
    
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Intelligent frame skipping
    if (deltaTime < this.currentTargetFrameTime * 0.9) {
      // Too early, skip this frame
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }
    
    // Track frame timing
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.config.rollingWindowSize) {
      this.frameTimes.shift();
    }
    
    // Calculate metrics
    this.updateMetrics(deltaTime, currentTime);
    
    // Execute frame callbacks
    for (const callback of this.frameCallbacks) {
      try {
        callback(deltaTime, this.metrics);
      } catch (e) {
        console.error('[PerformanceEngine] Frame callback error:', e);
      }
    }
    
    // Notify metrics listeners
    for (const callback of this.metricsCallbacks) {
      callback(this.metrics);
    }
    
    this.lastFrameTime = currentTime;
    this.frameCount++;
    
    // Adaptive adjustment
    this.maybeAdjustTarget(currentTime);
    
    // Continue loop
    this.rafId = requestAnimationFrame(this.tick);
  };
  
  // ---------------------------------------------------------------------------
  // METRICS CALCULATION
  // ---------------------------------------------------------------------------
  
  private updateMetrics(deltaTime: number, currentTime: number): void {
    // Calculate average frame time
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    
    // Calculate current FPS
    const currentFPS = 1000 / deltaTime;
    
    // Smooth the display FPS to prevent jittery numbers
    const smoothingFactor = this.config.smoothingFactor;
    const displayFPS = this.metrics.displayFPS + (currentFPS - this.metrics.displayFPS) * smoothingFactor;
    
    // Detect dropped frames (frame took > 50% longer than target)
    if (deltaTime > this.currentTargetFrameTime * 1.5) {
      this.droppedFrameCount++;
    }
    
    // Check if we're throttling
    const isThrottling = this.targetFPS < this.config.targets[this.capabilities.tier].max;
    
    this.metrics = {
      currentFPS: Math.round(currentFPS),
      displayFPS: Math.max(0, Math.min(999, displayFPS)),
      targetFPS: this.targetFPS,
      frameTime: deltaTime,
      avgFrameTime,
      droppedFrames: this.droppedFrameCount,
      deviceTier: this.capabilities.tier,
      isThrottling,
      thermalState: this.thermalState,
    };
  }
  
  // ---------------------------------------------------------------------------
  // ADAPTIVE FPS ADJUSTMENT
  // ---------------------------------------------------------------------------
  
  private maybeAdjustTarget(currentTime: number): void {
    // Don't adjust too frequently
    if (currentTime - this.lastAdjustmentTime < this.config.adjustmentInterval) {
      return;
    }
    
    // Skip adjustment if reduced motion is preferred
    if (this.capabilities.prefersReducedMotion) {
      return;
    }
    
    const tierConfig = this.config.targets[this.capabilities.tier];
    const avgFrameTime = this.metrics.avgFrameTime;
    const expectedFrameTime = this.currentTargetFrameTime;
    
    // Calculate frame time variance
    const variance = Math.abs(avgFrameTime - expectedFrameTime) / expectedFrameTime;
    
    // Check for dropped frames in the window
    const dropRate = this.droppedFrameCount / this.config.rollingWindowSize;
    
    // Determine if we need to adjust
    if (variance > this.config.dropThreshold || dropRate > 0.1) {
      // Performance is struggling - lower target
      const newTarget = Math.max(
        tierConfig.min,
        this.targetFPS - this.config.adjustmentStep
      );
      
      if (newTarget !== this.targetFPS) {
        console.log(`[PerformanceEngine] Lowering FPS target: ${this.targetFPS} → ${newTarget} (variance: ${(variance * 100).toFixed(1)}%)`);
        this.targetFPS = newTarget;
        this.currentTargetFrameTime = 1000 / this.targetFPS;
      }
      
      this.stableFrameCount = 0;
    } else if (variance < this.config.dropThreshold * 0.5 && dropRate < 0.02) {
      // Performance is stable
      this.stableFrameCount += this.config.rollingWindowSize;
      
      if (this.stableFrameCount >= this.config.stabilityThreshold) {
        // Try to increase FPS
        const maxAllowed = Math.min(tierConfig.max, this.capabilities.maxRefreshRate);
        const newTarget = Math.min(
          maxAllowed,
          this.targetFPS + this.config.adjustmentStep
        );
        
        if (newTarget !== this.targetFPS) {
          console.log(`[PerformanceEngine] Raising FPS target: ${this.targetFPS} → ${newTarget}`);
          this.targetFPS = newTarget;
          this.currentTargetFrameTime = 1000 / this.targetFPS;
        }
        
        this.stableFrameCount = 0;
      }
    }
    
    // Reset counters
    this.droppedFrameCount = 0;
    this.lastAdjustmentTime = currentTime;
  }
  
  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  
  public onFrame(callback: (deltaTime: number, metrics: PerformanceMetrics) => void): () => void {
    this.frameCallbacks.add(callback);
    return () => this.frameCallbacks.delete(callback);
  }
  
  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.metricsCallbacks.add(callback);
    return () => this.metricsCallbacks.delete(callback);
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }
  
  public setTargetFPS(fps: number): void {
    const tierConfig = this.config.targets[this.capabilities.tier];
    this.targetFPS = Math.max(tierConfig.min, Math.min(tierConfig.max, fps));
    this.currentTargetFrameTime = 1000 / this.targetFPS;
  }
  
  public getTargetFrameTime(): number {
    return this.currentTargetFrameTime;
  }
  
  public shouldRenderFrame(lastRenderTime: number): boolean {
    const now = performance.now();
    return (now - lastRenderTime) >= this.currentTargetFrameTime * 0.9;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let engineInstance: PerformanceEngine | null = null;

export function getPerformanceEngine(config?: Partial<FPSConfig>): PerformanceEngine {
  if (!engineInstance) {
    engineInstance = new PerformanceEngine(config);
  }
  return engineInstance;
}

export function resetPerformanceEngine(): void {
  if (engineInstance) {
    engineInstance.stop();
    engineInstance = null;
  }
}
