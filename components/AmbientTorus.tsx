import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AmbientTorus() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // SCENE SETUP
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xC0C0C0); // Matches the requested grey background
        scene.fog = new THREE.FogExp2(0xC0C0C0, 0.001); // Soft fog to blend

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // OBJECT: CHARCOAL TORUS
        const geometry = new THREE.TorusGeometry(3.5, 1.4, 16, 100); // Large, thick
        const material = new THREE.MeshLambertMaterial({
            color: 0x2a2a2a, // Charcoal / Dark Grey
            emissive: 0x000000
        });
        const torus = new THREE.Mesh(geometry, material);
        scene.add(torus);

        // Initial random rotation
        torus.rotation.x = Math.random() * Math.PI;
        torus.rotation.y = Math.random() * Math.PI;

        // LIGHTING (Soft, diffused)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        // ANIMATION STATE
        const clock = new THREE.Clock();
        // Simplex/Perlin noise approximation using sine waves for "organic" drift
        const noiseOffset = { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 };

        // Position geometry partially off-screen
        // Large scale
        torus.scale.set(1.5, 1.5, 1.5);
        torus.position.set(2, -1, -2); // Offset to be "background presence"

        const animate = () => {
            const t = clock.getElapsedTime() * 0.15; // Slow time

            // Gentle Rotation
            torus.rotation.x += 0.001;
            torus.rotation.y += 0.0015;

            // Organic Drift (Noise-like)
            torus.position.x = 2 + Math.sin(t + noiseOffset.x) * 0.5;
            torus.position.y = -1 + Math.cos(t * 0.8 + noiseOffset.y) * 0.5;
            torus.rotation.z = Math.sin(t * 0.5 + noiseOffset.z) * 0.2;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        // RESIZE HANDLER
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 z-[-2] pointer-events-none"
            style={{
                filter: 'blur(40px)', // Strong blur as requested
                opacity: 0.9
            }}
        />
    );
}
