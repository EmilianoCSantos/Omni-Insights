import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PCDViewer = ({ vertices, bounds, fileName }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const pointsRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !vertices || vertices.length === 0) {
      return;
    }

    // ===== SCENE SETUP =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // ===== CAMERA SETUP =====
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100000);
    cameraRef.current = camera;

    // Beräkna kamerans startposition baserat på bounds
    if (bounds) {
      const centerX = (bounds.min.x + bounds.max.x) / 2;
      const centerY = (bounds.min.y + bounds.max.y) / 2;
      const centerZ = (bounds.min.z + bounds.max.z) / 2;

      const sizeX = bounds.max.x - bounds.min.x;
      const sizeY = bounds.max.y - bounds.min.y;
      const sizeZ = bounds.max.z - bounds.min.z;
      const maxSize = Math.max(sizeX, sizeY, sizeZ);

      // Placera kameran på ett lämpligt avstånd
      const distance = maxSize * 1.5;
      camera.position.set(centerX + distance, centerY + distance, centerZ + distance);
      camera.lookAt(centerX, centerY, centerZ);
    } else {
      camera.position.z = 100;
    }

    // ===== RENDERER SETUP =====
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ===== LIGHTING =====
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // ===== POINT CLOUD GEOMETRY =====
    const geometry = new THREE.BufferGeometry();
    
    // Konvertera vertices till Float32Array
    const positions = new Float32Array(vertices.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Skapa färger för punkterna (gradient baserat på höjd/Z-värde)
    const colors = new Float32Array(vertices.length * 3);
    if (bounds && bounds.max.z !== bounds.min.z) {
      const zRange = bounds.max.z - bounds.min.z;
      for (let i = 0; i < vertices.length; i++) {
        const z = vertices[i][2];
        const normalizedZ = (z - bounds.min.z) / zRange;
        
        // Färgspektrum: blå -> cyan -> grön -> gul -> röd
        if (normalizedZ < 0.25) {
          colors[i * 3] = 0; // R
          colors[i * 3 + 1] = normalizedZ * 4; // G
          colors[i * 3 + 2] = 1; // B
        } else if (normalizedZ < 0.5) {
          colors[i * 3] = 0; // R
          colors[i * 3 + 1] = 1; // G
          colors[i * 3 + 2] = 1 - (normalizedZ - 0.25) * 4; // B
        } else if (normalizedZ < 0.75) {
          colors[i * 3] = (normalizedZ - 0.5) * 4; // R
          colors[i * 3 + 1] = 1; // G
          colors[i * 3 + 2] = 0; // B
        } else {
          colors[i * 3] = 1; // R
          colors[i * 3 + 1] = 1 - (normalizedZ - 0.75) * 4; // G
          colors[i * 3 + 2] = 0; // B
        }
      }
    } else {
      // Om ingen höjd-variation, använd ljusblå färg
      colors.fill(0.5);
      for (let i = 0; i < vertices.length; i++) {
        colors[i * 3] = 0.4; // R
        colors[i * 3 + 1] = 0.7; // G
        colors[i * 3 + 2] = 1.0; // B
      }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // ===== MATERIAL OCH POINTS =====
    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // ===== MOUSE CONTROLS =====
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      // Rotera punktmolnet baserat på musrörelse
      if (pointsRef.current) {
        pointsRef.current.rotation.y += deltaX * 0.005;
        pointsRef.current.rotation.x += deltaY * 0.005;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      
      // Zooma in/ut med scroll
      const zoomSpeed = 5;
      camera.position.multiplyScalar(1 + (e.deltaY > 0 ? 0.1 : -0.1) / zoomSpeed);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // ===== HANDLE WINDOW RESIZE =====
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // ===== ANIMATION LOOP =====
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // ===== CLEANUP =====
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [vertices, bounds]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {fileName && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: 10
        }}>
          📁 {fileName}
        </div>
      )}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        color: '#888888',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 10
      }}>
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default PCDViewer;
