import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeConfettiProps {
  active: boolean;
}

export const ThreeConfetti: React.FC<ThreeConfettiProps> = ({ active }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const confettiRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number>();
  const velocitiesRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const lastActiveRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Three.js scene
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    rendererRef.current = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    const container = containerRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    camera.position.z = 15;

    // Create confetti group
    confettiRef.current = new THREE.Group();
    scene.add(confettiRef.current);

    // Create confetti pieces
    const confettiCount = 100;
    const confettiColors = [
      '#FF69B4', '#FFD700', '#00CED1', 
      '#FF6347', '#98FB98', '#DDA0DD'
    ];

    for (let i = 0; i < confettiCount; i++) {
      // Randomly choose between rectangle and circle shapes
      const isRectangle = Math.random() > 0.5;
      let geometry;
      
      if (isRectangle) {
        // Rectangle confetti
        geometry = new THREE.PlaneGeometry(0.2, 0.4);
      } else {
        // Circle confetti
        geometry = new THREE.CircleGeometry(0.15, 8);
      }

      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(confettiColors[Math.floor(Math.random() * confettiColors.length)]),
        side: THREE.DoubleSide,
      });

      const confetti = new THREE.Mesh(geometry, material);
      confetti.visible = false; // Initially hidden
      confettiRef.current.add(confetti);

      // Initialize velocities
      velocitiesRef.current.push({
        x: 0,
        y: 0,
        z: 0
      });
    }

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Reset confetti for a new burst
  const resetConfetti = () => {
    if (!confettiRef.current) return;

    confettiRef.current.children.forEach((piece, index) => {
      piece.visible = true;
      piece.position.set(0, -5, 0);
      piece.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      // Reset velocity with new random values
      velocitiesRef.current[index] = {
        x: (Math.random() - 0.5) * 0.3,
        y: Math.random() * 0.2 + 0.1,
        z: (Math.random() - 0.5) * 0.3
      };
    });
  };

  useEffect(() => {
    if (!confettiRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const confetti = confettiRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    // Check if this is a new activation
    if (active && !lastActiveRef.current) {
      resetConfetti();
    }
    lastActiveRef.current = active;

    if (active) {
      // Animation function
      const animate = () => {
        confetti.children.forEach((piece, index) => {
          if (!piece.visible) return;

          const velocity = velocitiesRef.current[index];
          
          // Update position
          piece.position.x += velocity.x;
          piece.position.y += velocity.y;
          piece.position.z += velocity.z;
          
          // Add gravity effect
          velocitiesRef.current[index].y -= 0.01;
          
          // Rotate pieces
          piece.rotation.x += 0.1;
          piece.rotation.y += 0.1;
          piece.rotation.z += 0.1;

          // Hide pieces that fall below view
          if (piece.position.y < -10) {
            piece.visible = false;
          }
        });

        renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
    } else {
      // Hide all confetti pieces when not active
      confetti.children.forEach(piece => {
        piece.visible = false;
      });

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    />
  );
};