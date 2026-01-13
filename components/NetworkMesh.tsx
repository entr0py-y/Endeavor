import { useEffect, useRef, useCallback } from 'react';
import { getPerformanceEngine } from '@/lib/performanceEngine';

interface Node {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
}

interface Edge {
    from: number;
    to: number;
    distance: number;
}

// Fluid scale factor for network mesh
const getFluidScale = () => {
    if (typeof window === 'undefined') return 1;
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(0.5, Math.min(1.5, vmin / 1440));
};

const NetworkMesh: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const nodesRef = useRef<Node[]>([]);
    const edgesRef = useRef<Edge[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
    const isMobileRef = useRef(false);
    const timeRef = useRef(0);
    const lastMouseMoveRef = useRef(0);
    const glowIntensityRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const performanceEngineRef = useRef<ReturnType<typeof getPerformanceEngine> | null>(null);
    const fluidScaleRef = useRef(1);

    // Configuration - Fluid scaling based on viewport
    // Node count and connection distances scale with viewport
    const getNodeCount = () => {
        const scale = getFluidScale();
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            return Math.round(40 * Math.max(0.7, scale)); // Mobile: fewer nodes, scaled
        }
        return Math.round(120 * Math.max(0.6, Math.min(1.3, scale))); // Desktop: scaled node count
    };
    
    // Connection distances scale with viewport for proportional look
    const getConnectionDistance = (isMobile: boolean) => {
        const scale = getFluidScale();
        const baseDistance = isMobile ? 120 : 160;
        return Math.round(baseDistance * Math.max(0.7, Math.min(1.4, scale)));
    };
    
    const getGlowRadius = () => {
        const scale = getFluidScale();
        return Math.round(200 * Math.max(0.6, Math.min(1.4, scale)));
    };
    
    const getDriftAmplitude = () => {
        const scale = getFluidScale();
        return 30 * Math.max(0.7, Math.min(1.3, scale));
    };

    const DRIFT_SPEED = 0.15;
    const LERP_FACTOR = 0.08;

    // Initialize nodes - Grid-based distribution with jitter for even spread
    const initNodes = useCallback((width: number, height: number) => {
        const nodes: Node[] = [];
        const NODE_COUNT = getNodeCount();

        // Calculate grid dimensions for even distribution
        const aspectRatio = width / height;
        const cols = Math.ceil(Math.sqrt(NODE_COUNT * aspectRatio));
        const rows = Math.ceil(NODE_COUNT / cols);

        const cellWidth = width / cols;
        const cellHeight = height / rows;
        const jitter = 0.6; // More randomness for organic spread

        let count = 0;
        for (let row = 0; row < rows && count < NODE_COUNT; row++) {
            for (let col = 0; col < cols && count < NODE_COUNT; col++) {
                // Center of cell + jitter
                const x = (col + 0.5 + (Math.random() - 0.5) * jitter) * cellWidth;
                const y = (row + 0.5 + (Math.random() - 0.5) * jitter) * cellHeight;

                nodes.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                });
                count++;
            }
        }

        return nodes;
    }, []);

    // Calculate edges (connections between nearby nodes)
    const calculateEdges = useCallback((nodes: Node[], isMobile: boolean) => {
        const edges: Edge[] = [];
        const CONNECTION_DISTANCE = getConnectionDistance(isMobile);

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONNECTION_DISTANCE) {
                    edges.push({ from: i, to: j, distance });
                }
            }
        }

        return edges;
    }, []);

    // Draw the mesh
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const nodes = nodesRef.current;
        const time = timeRef.current;
        const isMobile = isMobileRef.current;
        const GLOW_RADIUS = getGlowRadius();
        const DRIFT_AMPLITUDE = getDriftAmplitude();

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse position interpolation (lerp)
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * LERP_FACTOR;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * LERP_FACTOR;

        // Glow intensity fades when cursor stops moving
        const timeSinceMove = Date.now() - lastMouseMoveRef.current;
        const targetIntensity = timeSinceMove < 3000 ? 1 : Math.max(0, 1 - (timeSinceMove - 3000) / 2000);
        glowIntensityRef.current += (targetIntensity - glowIntensityRef.current) * 0.05;

        // Subtle pulse for organic feel
        const pulse = 1 + Math.sin(time * 0.002) * 0.08;
        const microFlicker = 1 + (Math.random() - 0.5) * 0.02;

        // Update node positions (organic drift)
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const driftX = Math.sin(time * 0.001 + i * 0.5) * DRIFT_AMPLITUDE;
            const driftY = Math.cos(time * 0.0012 + i * 0.3) * DRIFT_AMPLITUDE;

            node.x = node.baseX + driftX * DRIFT_SPEED;
            node.y = node.baseY + driftY * DRIFT_SPEED;

            // Wrap around edges
            if (node.x < -50) node.baseX = width + 50;
            if (node.x > width + 50) node.baseX = -50;
            if (node.y < -50) node.baseY = height + 50;
            if (node.y > height + 50) node.baseY = -50;
        }

        // Recalculate edges periodically for performance
        if (Math.floor(time) % 60 === 0) {
            edgesRef.current = calculateEdges(nodes, isMobile);
        }

        const edges = edgesRef.current;
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;

        // WHITE NEON COLORS - Increased visibility
        const lineBase = 'rgba(255, 255, 255, 0.18)';

        // Pre-calculate glow radius squared to avoid sqrt in loop
        const glowRadiusSquared = GLOW_RADIUS * GLOW_RADIUS;

        // Separate edges into batches by type for fewer state changes
        const baseEdges: { ax: number; ay: number; bx: number; by: number }[] = [];
        const glowEdges: { ax: number; ay: number; bx: number; by: number; opacity: number; width: number; glow: boolean }[] = [];

        // Categorize edges
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            const nodeA = nodes[edge.from];
            const nodeB = nodes[edge.to];

            const midX = (nodeA.x + nodeB.x) * 0.5;
            const midY = (nodeA.y + nodeB.y) * 0.5;

            // Distance from mouse to line midpoint (squared first)
            const dx = midX - mouseX;
            const dy = midY - mouseY;
            const distSquared = dx * dx + dy * dy;

            if (!isMobile && distSquared < glowRadiusSquared) {
                const distToMouse = Math.sqrt(distSquared);
                const glowFactor = Math.max(0, 1 - distToMouse / GLOW_RADIUS) * glowIntensityRef.current;

                if (glowFactor > 0.01) {
                    const glowOpacity = glowFactor * 0.8 * pulse * microFlicker;
                    glowEdges.push({
                        ax: nodeA.x, ay: nodeA.y,
                        bx: nodeB.x, by: nodeB.y,
                        opacity: glowOpacity,
                        width: 1 + glowFactor * 2,
                        glow: glowFactor > 0.4
                    });
                    continue;
                }
            }

            baseEdges.push({ ax: nodeA.x, ay: nodeA.y, bx: nodeB.x, by: nodeB.y });
        }

        // Draw base edges in one batch
        const baseLineWidth = 0.8 * Math.max(0.6, getFluidScale());
        ctx.strokeStyle = lineBase;
        ctx.lineWidth = baseLineWidth;
        ctx.beginPath();
        for (let i = 0; i < baseEdges.length; i++) {
            const e = baseEdges[i];
            ctx.moveTo(e.ax, e.ay);
            ctx.lineTo(e.bx, e.by);
        }
        ctx.stroke();

        // Draw glow edges (these need individual styling)
        const fluidScale = getFluidScale();
        for (let i = 0; i < glowEdges.length; i++) {
            const e = glowEdges[i];
            ctx.beginPath();
            ctx.moveTo(e.ax, e.ay);
            ctx.lineTo(e.bx, e.by);
            ctx.strokeStyle = `rgba(255, 255, 255, ${e.opacity.toFixed(3)})`;
            ctx.lineWidth = e.width * Math.max(0.7, fluidScale);

            if (e.glow) {
                ctx.shadowBlur = 18 * (e.opacity / 0.8) * Math.max(0.6, fluidScale);
                ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            }

            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }, [calculateEdges]);

    // Animation loop with adaptive frame rate from performance engine
    const animate = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use performance engine for adaptive frame timing
        const engine = performanceEngineRef.current;
        if (engine && !engine.shouldRenderFrame(lastFrameTimeRef.current)) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        const elapsed = timestamp - lastFrameTimeRef.current;
        lastFrameTimeRef.current = timestamp;
        
        // Scale time increment based on actual elapsed time for smooth animation
        const targetFrameTime = engine ? engine.getTargetFrameTime() : (isMobileRef.current ? 33 : 16);
        timeRef.current += Math.min(elapsed, targetFrameTime * 2); // Cap to prevent jumps
        
        draw(ctx, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

        animationRef.current = requestAnimationFrame(animate);
    }, [draw]);

    // Initialize and resize handler
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Initialize performance engine
        performanceEngineRef.current = getPerformanceEngine();
        performanceEngineRef.current.start();

        // Check if mobile
        isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }

            // Check if mobile on resize
            isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;

            // Reinitialize nodes on resize
            nodesRef.current = initNodes(rect.width, rect.height);
            edgesRef.current = calculateEdges(nodesRef.current, isMobileRef.current);
        };

        // Mouse move handler - adjust for canvas offset
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            // Adjust mouse position relative to the offset canvas
            mouseRef.current.targetX = e.clientX - rect.left;
            mouseRef.current.targetY = e.clientY - rect.top;
            lastMouseMoveRef.current = Date.now();
        };

        // Touch move handler (reduced effect)
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseRef.current.targetX = e.touches[0].clientX;
                mouseRef.current.targetY = e.touches[0].clientY;
                lastMouseMoveRef.current = Date.now();
            }
        };

        // Mouse leave handler
        const handleMouseLeave = () => {
            mouseRef.current.targetX = -1000;
            mouseRef.current.targetY = -1000;
        };

        // Initialize after a brief delay to avoid blocking render
        const initTimeout = setTimeout(() => {
            resize();
            requestAnimationFrame(animate);
        }, 100);

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearTimeout(initTimeout);
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [animate, initNodes, calculateEdges]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: '-15%',
                left: '-15%',
                width: '130%',
                height: '130%',
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
};

export default NetworkMesh;
