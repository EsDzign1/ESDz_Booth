import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Maximize2, Minimize2, RotateCcw, Camera, Sun, Moon, 
  Sparkles, Layers, Download, CheckCircle2, MessageSquare,
  HelpCircle, Eye
} from 'lucide-react';
import { BoothConfig, PlacedBoothItem, ClientFeedback } from '../types';

interface ThreeDPreviewProps {
  config: BoothConfig;
  items: PlacedBoothItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onItemPositionChange?: (id: string, x: number, z: number) => void;
  feedbacks: ClientFeedback[];
  onAddFeedback?: (text: string, itemName?: string) => void;
  className?: string;
}

type CameraPreset = 'iso' | 'walk' | 'front' | 'top';
type LightingTheme = 'hall' | 'spotlight' | 'evening' | 'cyber';

export const ThreeDPreview: React.FC<ThreeDPreviewProps> = ({
  config,
  items,
  selectedItemId,
  onSelectItem,
  feedbacks,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsStateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    theta: THREE.MathUtils.degToRad(35), // horizontal orbit
    phi: THREE.MathUtils.degToRad(55),   // vertical angle
    distance: 12,
    target: new THREE.Vector3(0, 1.2, 0),
    autoRotate: false,
  });

  // State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentCameraPreset, setCurrentCameraPreset] = useState<CameraPreset>('iso');
  const [lightingTheme, setLightingTheme] = useState<LightingTheme>('hall');
  const [autoRotate, setAutoRotate] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [showHelperTips, setShowHelperTips] = useState(true);
  const [quickFeedbackText, setQuickFeedbackText] = useState('');
  const [commentTarget, setCommentTarget] = useState<string | null>(null);

  // References to dynamic scene groups
  const boothGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const itemMeshesMapRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Texture helper generator (canvas-based procedural for instant offline loading)
  const generateTexture = useCallback((type: string, color1: string, color2: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (type === 'wood') {
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = color2;
      ctx.lineWidth = 4;
      for (let i = 0; i < 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 512; i += 8) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
    } else if (type === 'screen_video') {
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Graph & futuristic UI
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 380);
      ctx.bezierCurveTo(140, 180, 260, 420, 480, 120);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineTo(480, 420);
      ctx.lineTo(40, 420);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(config.brandName || 'ES Dzign Research', 40, 80);

      ctx.fillStyle = '#93c5fd';
      ctx.font = '20px monospace';
      ctx.fillText('interior • architecture • design', 40, 120);
    } else if (type === 'banner_sign') {
      ctx.fillStyle = config.brandColor;
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(config.brandName || 'ES Dzign Research', 256, 240);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '22px sans-serif';
      ctx.fillText(config.tagline || 'interior • architecture • design', 256, 290);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [config.brandColor, config.brandName, config.tagline]);

  // Initialize Three.js Engine
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.025);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(9, 7, 9);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Groups
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    const boothGroup = new THREE.Group();
    scene.add(boothGroup);
    boothGroupRef.current = boothGroup;

    // Outer Exhibition Hall Environment (Ambient floor grid & distant exhibition truss)
    const hallFloorGeo = new THREE.PlaneGeometry(60, 60);
    const hallFloorMat = new THREE.MeshStandardMaterial({
      color: 0x12141a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const hallFloor = new THREE.Mesh(hallFloorGeo, hallFloorMat);
    hallFloor.rotation.x = -Math.PI / 2;
    hallFloor.position.y = -0.01;
    hallFloor.receiveShadow = true;
    scene.add(hallFloor);

    // Grid helper for architectural perception
    const gridHelper = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // Distant exhibition perimeter columns
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 12, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e222d, roughness: 0.7 });
    for (let x of [-16, 16]) {
      for (let z of [-16, 16]) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 6, z);
        scene.add(pillar);
      }
    }

    // Overhead high hall truss grid
    const hallTrussGeo = new THREE.BoxGeometry(40, 0.2, 0.2);
    const hallTrussMat = new THREE.MeshStandardMaterial({ color: 0x272e3d, metalness: 0.5 });
    for (let i = -15; i <= 15; i += 7.5) {
      const barX = new THREE.Mesh(hallTrussGeo, hallTrussMat);
      barX.position.set(0, 8.5, i);
      scene.add(barX);
      const barZ = new THREE.Mesh(hallTrussGeo, hallTrussMat);
      barZ.rotation.y = Math.PI / 2;
      barZ.position.set(i, 8.5, 0);
      scene.add(barZ);
    }

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const state = controlsStateRef.current;
      if (state.autoRotate) {
        state.theta += 0.004;
      }

      // Compute camera position from spherical coords
      const x = state.target.x + state.distance * Math.sin(state.phi) * Math.sin(state.theta);
      const y = state.target.y + state.distance * Math.cos(state.phi);
      const z = state.target.z + state.distance * Math.sin(state.phi) * Math.cos(state.theta);

      camera.position.set(x, y, z);
      camera.lookAt(state.target);

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Lighting Atmosphere
  useEffect(() => {
    const lightsGroup = lightsGroupRef.current;
    if (!lightsGroup) return;

    // Clear previous lights
    while (lightsGroup.children.length > 0) {
      lightsGroup.remove(lightsGroup.children[0]);
    }

    if (lightingTheme === 'hall') {
      // Clean, bright commercial exhibition hall daylight
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1f2937, 0.85);
      lightsGroup.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
      dirLight.position.set(10, 15, 8);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 35;
      dirLight.shadow.camera.left = -10;
      dirLight.shadow.camera.right = 10;
      dirLight.shadow.camera.top = 10;
      dirLight.shadow.camera.bottom = -10;
      dirLight.shadow.bias = -0.0005;
      lightsGroup.add(dirLight);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
      fillLight.position.set(-10, 8, -8);
      lightsGroup.add(fillLight);
    } else if (lightingTheme === 'spotlight') {
      // High-contrast dramatic spotlight focus
      const hemiLight = new THREE.HemisphereLight(0x334155, 0x09090b, 0.3);
      lightsGroup.add(hemiLight);

      const spot1 = new THREE.SpotLight(0xffffff, 3.5, 20, Math.PI / 4, 0.3, 1);
      spot1.position.set(3, 7, 3);
      spot1.castShadow = true;
      lightsGroup.add(spot1);

      const spot2 = new THREE.SpotLight(0xfff5ea, 3.0, 20, Math.PI / 4, 0.3, 1);
      spot2.position.set(-3, 7, -2);
      spot2.castShadow = true;
      lightsGroup.add(spot2);
    } else if (lightingTheme === 'evening') {
      // Warm golden VIP cocktail ambiance
      const hemiLight = new THREE.HemisphereLight(0xfef3c7, 0x1c1917, 0.6);
      lightsGroup.add(hemiLight);

      const warmKey = new THREE.DirectionalLight(0xf59e0b, 1.6);
      warmKey.position.set(8, 12, 6);
      warmKey.castShadow = true;
      lightsGroup.add(warmKey);

      const magentaFill = new THREE.DirectionalLight(0xd946ef, 0.3);
      magentaFill.position.set(-6, 5, -6);
      lightsGroup.add(magentaFill);
    } else if (lightingTheme === 'cyber') {
      // High-tech cyberpunk trade show
      const hemiLight = new THREE.HemisphereLight(0x06b6d4, 0x09090b, 0.4);
      lightsGroup.add(hemiLight);

      const cyanKey = new THREE.DirectionalLight(0x06b6d4, 1.8);
      cyanKey.position.set(7, 10, 5);
      cyanKey.castShadow = true;
      lightsGroup.add(cyanKey);

      const purpleRim = new THREE.DirectionalLight(0xa855f7, 1.2);
      purpleRim.position.set(-7, 6, -5);
      lightsGroup.add(purpleRim);
    }
  }, [lightingTheme]);

  // Build / Re-render 3D Booth Geometry when Config or Items change
  useEffect(() => {
    const boothGroup = boothGroupRef.current;
    if (!boothGroup) return;

    // Clear previous booth elements
    while (boothGroup.children.length > 0) {
      const child = boothGroup.children[0];
      boothGroup.remove(child);
    }
    itemMeshesMapRef.current.clear();

    const { width: bW, depth: bD, wallHeight: bH, type: bType, brandColor, secondaryColor, flooring } = config;

    // 1. BOOTH FLOOR PLATFORM
    let floorColor = 0xe2e8f0;
    let floorRoughness = 0.4;
    let floorMetalness = 0.1;

    if (flooring === 'wood_oak') {
      floorColor = 0xc29b6a;
      floorRoughness = 0.6;
    } else if (flooring === 'wood_dark') {
      floorColor = 0x523d2e;
      floorRoughness = 0.5;
    } else if (flooring === 'carpet_navy') {
      floorColor = 0x1e3a8a;
      floorRoughness = 0.9;
    } else if (flooring === 'carpet_grey') {
      floorColor = 0x374151;
      floorRoughness = 0.95;
    } else if (flooring === 'concrete_polished') {
      floorColor = 0x94a3b8;
      floorRoughness = 0.25;
      floorMetalness = 0.2;
    } else if (flooring === 'marble_white') {
      floorColor = 0xf8fafc;
      floorRoughness = 0.15;
      floorMetalness = 0.2;
    }

    // Platform riser (standard raised expo deck 10cm with ramp/beveled edge)
    const platformThick = 0.08;
    const platformGeo = new THREE.BoxGeometry(bW, platformThick, bD);
    const platformMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: floorRoughness,
      metalness: floorMetalness,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, platformThick / 2, 0);
    platform.receiveShadow = true;
    boothGroup.add(platform);

    // Aluminum edging around platform floor
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const edgeTrimGeo = new THREE.BoxGeometry(bW + 0.04, platformThick, bD + 0.04);
    const edgeTrim = new THREE.Mesh(edgeTrimGeo, edgeMat);
    edgeTrim.position.set(0, platformThick / 2 - 0.005, 0);
    boothGroup.add(edgeTrim);

    // 2. WALL PANELS (Determined by Booth Type)
    const wallThick = 0.12;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.05,
    });
    const brandAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(brandColor),
      roughness: 0.3,
      metalness: 0.1,
    });

    const createWall = (w: number, h: number, x: number, y: number, z: number, rotY = 0, isBackWall = false) => {
      const wallMeshGroup = new THREE.Group();

      // Main structural wall
      const wallG = new THREE.BoxGeometry(w, h, wallThick);
      const wall = new THREE.Mesh(wallG, wallMat);
      wall.castShadow = true;
      wall.receiveShadow = true;
      wallMeshGroup.add(wall);

      // Top fascia / header accent band
      const fasciaHeight = 0.45;
      const fasciaG = new THREE.BoxGeometry(w, fasciaHeight, wallThick + 0.04);
      const fascia = new THREE.Mesh(fasciaG, brandAccentMat);
      fascia.position.set(0, h / 2 - fasciaHeight / 2, 0.02);
      wallMeshGroup.add(fascia);

      // Bottom kickplate (anodized aluminum)
      const kickG = new THREE.BoxGeometry(w, 0.15, wallThick + 0.02);
      const kick = new THREE.Mesh(kickG, edgeMat);
      kick.position.set(0, -h / 2 + 0.075, 0.01);
      wallMeshGroup.add(kick);

      // If back wall, add brand signage plaque
      if (isBackWall) {
        const logoPanelG = new THREE.BoxGeometry(w * 0.55, 0.8, 0.05);
        const logoCanvasTex = generateTexture('banner_sign', brandColor, secondaryColor);
        const logoMat = new THREE.MeshStandardMaterial({
          map: logoCanvasTex,
          roughness: 0.3,
        });
        const logoMesh = new THREE.Mesh(logoPanelG, logoMat);
        logoMesh.position.set(0, h * 0.2, wallThick / 2 + 0.03);
        wallMeshGroup.add(logoMesh);

        // Wall spotlights mounted on overhead goose-necks
        const numSpots = Math.max(2, Math.floor(w / 1.8));
        for (let i = 0; i < numSpots; i++) {
          const spotX = -w / 2 + ((i + 1) * w) / (numSpots + 1);
          // Stem
          const stemG = new THREE.CylinderGeometry(0.015, 0.015, 0.6);
          const stem = new THREE.Mesh(stemG, edgeMat);
          stem.rotation.x = Math.PI / 2.5;
          stem.position.set(spotX, h / 2 + 0.1, wallThick / 2 + 0.25);
          wallMeshGroup.add(stem);

          // Head lamp
          const headG = new THREE.CylinderGeometry(0.04, 0.06, 0.1, 12);
          const headMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
          const head = new THREE.Mesh(headG, headMat);
          head.rotation.x = Math.PI / 1.5;
          head.position.set(spotX, h / 2 + 0.2, wallThick / 2 + 0.5);
          wallMeshGroup.add(head);
        }
      }

      wallMeshGroup.position.set(x, y, z);
      wallMeshGroup.rotation.y = rotY;
      boothGroup.add(wallMeshGroup);
    };

    // Placement of walls according to Booth Type:
    // Coordinates: center is (0, y, 0).
    // Back is -bD/2. Front is +bD/2. Left is -bW/2. Right is +bW/2.
    if (bType === 'inline') {
      // 3 Walls: Back wall, Left wall, Right wall
      createWall(bW, bH, 0, bH / 2 + platformThick, -bD / 2 + wallThick / 2, 0, true);
      createWall(bD, bH, -bW / 2 + wallThick / 2, bH / 2 + platformThick, 0, Math.PI / 2, false);
      createWall(bD, bH, bW / 2 - wallThick / 2, bH / 2 + platformThick, 0, -Math.PI / 2, false);
    } else if (bType === 'corner') {
      // 2 Walls: Back wall and Left wall (Open front & right aisles)
      createWall(bW, bH, 0, bH / 2 + platformThick, -bD / 2 + wallThick / 2, 0, true);
      createWall(bD, bH, -bW / 2 + wallThick / 2, bH / 2 + platformThick, 0, Math.PI / 2, false);
    } else if (bType === 'peninsula') {
      // 1 Wall: Back wall only (Open left, front, right aisles)
      createWall(bW, bH, 0, bH / 2 + platformThick, -bD / 2 + wallThick / 2, 0, true);
    } else if (bType === 'island') {
      // Island: 0 solid perimeter walls. All sides open.
      // Often features an architectural truss pillar or header.
    }

    // 3. OVERHEAD TRUSS RIGGING (If enabled or Island)
    if (config.hasOverheadTruss || bType === 'island') {
      const trussGroup = new THREE.Group();
      const trussHeight = Math.max(bH + 0.6, 3.8);
      const trussMetal = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25,
      });

      // 4 corner vertical truss uprights for island or 2 front for peninsula
      const pillarPositions: [number, number][] = [];
      if (bType === 'island') {
        pillarPositions.push([-bW / 2 + 0.3, -bD / 2 + 0.3]);
        pillarPositions.push([bW / 2 - 0.3, -bD / 2 + 0.3]);
        pillarPositions.push([-bW / 2 + 0.3, bD / 2 - 0.3]);
        pillarPositions.push([bW / 2 - 0.3, bD / 2 - 0.3]);
      } else if (bType === 'corner') {
        pillarPositions.push([bW / 2 - 0.3, bD / 2 - 0.3]);
      }

      pillarPositions.forEach(([px, pz]) => {
        const pG = new THREE.BoxGeometry(0.25, trussHeight, 0.25);
        const pillar = new THREE.Mesh(pG, trussMetal);
        pillar.position.set(px, trussHeight / 2 + platformThick, pz);
        pillar.castShadow = true;
        trussGroup.add(pillar);
      });

      // Horizontal perimeter box truss loop
      const createTrussBeam = (len: number, x: number, y: number, z: number, rotY = 0) => {
        const beamG = new THREE.BoxGeometry(len, 0.25, 0.25);
        const beam = new THREE.Mesh(beamG, trussMetal);
        beam.position.set(x, y, z);
        beam.rotation.y = rotY;
        beam.castShadow = true;
        trussGroup.add(beam);
      };

      createTrussBeam(bW, 0, trussHeight + platformThick, -bD / 2, 0);
      createTrussBeam(bW, 0, trussHeight + platformThick, bD / 2, 0);
      createTrussBeam(bD, -bW / 2, trussHeight + platformThick, 0, Math.PI / 2);
      createTrussBeam(bD, bW / 2, trussHeight + platformThick, 0, Math.PI / 2);

      boothGroup.add(trussGroup);
    }

    // 4. SUSPENDED OVERHEAD BANNER (If enabled)
    if (config.hasHangingBanner || bType === 'island') {
      const bannerY = Math.max(bH + 1.2, 4.5);
      const bannerSize = Math.min(bW * 0.45, 3.2);
      const bannerCubeG = new THREE.BoxGeometry(bannerSize, 1.1, bannerSize);
      const bannerMat = new THREE.MeshStandardMaterial({
        map: generateTexture('banner_sign', brandColor, secondaryColor),
        roughness: 0.3,
      });
      const bannerMesh = new THREE.Mesh(bannerCubeG, bannerMat);
      bannerMesh.position.set(0, bannerY, 0);
      boothGroup.add(bannerMesh);

      // Rigging cables to ceiling
      const cableMat = new THREE.LineBasicMaterial({ color: 0x64748b });
      const corners = [
        [-bannerSize / 2, bannerSize / 2],
        [bannerSize / 2, bannerSize / 2],
        [-bannerSize / 2, -bannerSize / 2],
        [bannerSize / 2, -bannerSize / 2],
      ];
      corners.forEach(([cx, cz]) => {
        const points = [
          new THREE.Vector3(cx, bannerY + 0.55, cz),
          new THREE.Vector3(cx * 1.5, 9, cz * 1.5),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, cableMat);
        boothGroup.add(line);
      });
    }

    // 5. RENDER PLACED FURNITURE & INTERACTIVE OBJECTS
    items.forEach((item) => {
      const itemGroup = new THREE.Group();
      const isSelected = item.id === selectedItemId;

      // Generate procedural 3D model according to item.type
      switch (item.type) {
        case 'reception_counter': {
          // Counter body
          const bodyG = new THREE.BoxGeometry(item.width, item.height - 0.05, item.depth * 0.85);
          const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
          const body = new THREE.Mesh(bodyG, bodyMat);
          body.position.y = (item.height - 0.05) / 2;
          body.castShadow = true;
          body.receiveShadow = true;
          itemGroup.add(body);

          // Countertop (quartz / sleek white)
          const topG = new THREE.BoxGeometry(item.width + 0.08, 0.06, item.depth + 0.08);
          const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1 });
          const top = new THREE.Mesh(topG, topMat);
          top.position.y = item.height;
          top.castShadow = true;
          itemGroup.add(top);

          // Acrylic illuminated front fascia
          const frontG = new THREE.BoxGeometry(item.width * 0.8, item.height * 0.55, 0.04);
          const frontMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(brandColor),
            emissive: new THREE.Color(brandColor),
            emissiveIntensity: 0.35,
            roughness: 0.2,
          });
          const frontFascia = new THREE.Mesh(frontG, frontMat);
          frontFascia.position.set(0, item.height * 0.5, item.depth * 0.43);
          itemGroup.add(frontFascia);
          break;
        }

        case 'curved_counter': {
          // Sculptural reception curve
          const curveGeo = new THREE.CylinderGeometry(item.width * 0.45, item.width * 0.45, item.height, 24, 1, false, 0, Math.PI);
          const curveMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 });
          const curvedBody = new THREE.Mesh(curveGeo, curveMat);
          curvedBody.position.y = item.height / 2;
          curvedBody.rotation.y = -Math.PI / 2;
          curvedBody.castShadow = true;
          itemGroup.add(curvedBody);

          // Top ledge
          const topGeo = new THREE.CylinderGeometry(item.width * 0.48, item.width * 0.48, 0.05, 24, 1, false, 0, Math.PI);
          const topMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
          const topPlate = new THREE.Mesh(topGeo, topMat);
          topPlate.position.y = item.height + 0.025;
          topPlate.rotation.y = -Math.PI / 2;
          itemGroup.add(topPlate);

          // Glowing brand accent line
          const glowRingGeo = new THREE.TorusGeometry(item.width * 0.46, 0.02, 8, 24, Math.PI);
          const glowRingMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(brandColor) });
          const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
          glowRing.position.set(0, item.height * 0.4, 0);
          glowRing.rotation.x = Math.PI / 2;
          glowRing.rotation.z = Math.PI;
          itemGroup.add(glowRing);
          break;
        }

        case 'led_video_wall': {
          // Frame & truss back support
          const frameG = new THREE.BoxGeometry(item.width + 0.1, item.height + 0.1, item.depth);
          const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.8, roughness: 0.2 });
          const frame = new THREE.Mesh(frameG, frameMat);
          frame.position.y = item.height / 2;
          frame.castShadow = true;
          itemGroup.add(frame);

          // Glowing high-res active video display surface
          const screenG = new THREE.BoxGeometry(item.width, item.height, 0.02);
          const screenTex = generateTexture('screen_video', brandColor, secondaryColor);
          const screenMat = new THREE.MeshStandardMaterial({
            map: screenTex,
            emissive: new THREE.Color(0x38bdf8),
            emissiveIntensity: 0.4,
            roughness: 0.2,
          });
          const screen = new THREE.Mesh(screenG, screenMat);
          screen.position.set(0, item.height / 2, item.depth / 2 + 0.01);
          itemGroup.add(screen);

          // Twin support feet
          for (let fx of [-item.width * 0.35, item.width * 0.35]) {
            const footG = new THREE.BoxGeometry(0.12, 0.06, 0.8);
            const foot = new THREE.Mesh(footG, frameMat);
            foot.position.set(fx, 0.03, 0);
            itemGroup.add(foot);
          }
          break;
        }

        case 'touch_kiosk': {
          // Upright slanted kiosk body
          const baseG = new THREE.BoxGeometry(item.width, 0.08, item.depth);
          const metalMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7, roughness: 0.3 });
          const base = new THREE.Mesh(baseG, metalMat);
          base.position.y = 0.04;
          itemGroup.add(base);

          const stalkG = new THREE.BoxGeometry(item.width * 0.4, item.height * 0.7, 0.12);
          const stalk = new THREE.Mesh(stalkG, metalMat);
          stalk.position.set(0, item.height * 0.38, 0);
          itemGroup.add(stalk);

          // Angled touch screen
          const screenG = new THREE.BoxGeometry(item.width * 0.9, item.height * 0.45, 0.04);
          const touchMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            emissive: 0x0284c7,
            emissiveIntensity: 0.5,
            roughness: 0.1,
          });
          const screen = new THREE.Mesh(screenG, touchMat);
          screen.position.set(0, item.height * 0.78, 0.06);
          screen.rotation.x = -Math.PI / 7;
          itemGroup.add(screen);
          break;
        }

        case 'lounge_seating': {
          // Designer Sofa Base & Cushions
          const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
          const cushionMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
          const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });

          // Sofa seat bench
          const seatG = new THREE.BoxGeometry(item.width * 0.75, 0.35, item.depth * 0.55);
          const seat = new THREE.Mesh(seatG, cushionMat);
          seat.position.set(0, 0.28, -item.depth * 0.2);
          seat.castShadow = true;
          itemGroup.add(seat);

          // Sofa backrest
          const backG = new THREE.BoxGeometry(item.width * 0.75, 0.45, 0.2);
          const back = new THREE.Mesh(backG, sofaMat);
          back.position.set(0, 0.55, -item.depth * 0.45);
          back.castShadow = true;
          itemGroup.add(back);

          // Low coffee table
          const tableG = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 24);
          const table = new THREE.Mesh(tableG, woodMat);
          table.position.set(0, 0.18, item.depth * 0.2);
          table.castShadow = true;
          itemGroup.add(table);

          // Twin designer armchairs
          for (let chairX of [-item.width * 0.4, item.width * 0.4]) {
            const chairG = new THREE.BoxGeometry(0.5, 0.6, 0.5);
            const chair = new THREE.Mesh(chairG, sofaMat);
            chair.position.set(chairX, 0.3, item.depth * 0.15);
            chair.rotation.y = chairX < 0 ? Math.PI / 4 : -Math.PI / 4;
            chair.castShadow = true;
            itemGroup.add(chair);
          }
          break;
        }

        case 'meeting_table': {
          // Chrome base & pedestal
          const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.1 });
          const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.1,
            transmission: 0.8,
            thickness: 0.03,
          });

          // Pedestal
          const baseG = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 24);
          const base = new THREE.Mesh(baseG, chromeMat);
          base.position.y = 0.02;
          itemGroup.add(base);

          const stemG = new THREE.CylinderGeometry(0.05, 0.05, item.height - 0.05, 16);
          const stem = new THREE.Mesh(stemG, chromeMat);
          stem.position.y = item.height / 2;
          itemGroup.add(stem);

          // Table Top
          const topG = new THREE.CylinderGeometry(item.width * 0.48, item.width * 0.48, 0.04, 32);
          const top = new THREE.Mesh(topG, glassMat);
          top.position.y = item.height;
          top.castShadow = true;
          itemGroup.add(top);

          // 3 Surrounding Conference Chairs
          for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3;
            const dist = item.width * 0.46;
            const cx = Math.sin(angle) * dist;
            const cz = Math.cos(angle) * dist;

            const chairGroup = new THREE.Group();
            const seatG = new THREE.BoxGeometry(0.4, 0.06, 0.4);
            const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
            const seat = new THREE.Mesh(seatG, chairMat);
            seat.position.y = 0.45;
            chairGroup.add(seat);

            const backG = new THREE.BoxGeometry(0.4, 0.4, 0.05);
            const back = new THREE.Mesh(backG, chairMat);
            back.position.set(0, 0.65, 0.18);
            chairGroup.add(back);

            const legG = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);
            const leg = new THREE.Mesh(legG, chromeMat);
            leg.position.y = 0.225;
            chairGroup.add(leg);

            chairGroup.position.set(cx, 0, cz);
            chairGroup.lookAt(0, 0, 0);
            itemGroup.add(chairGroup);
          }
          break;
        }

        case 'high_bar_table': {
          const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
          const blackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 });

          // Tall bar table
          const stemG = new THREE.CylinderGeometry(0.04, 0.04, item.height, 16);
          const stem = new THREE.Mesh(stemG, chromeMat);
          stem.position.y = item.height / 2;
          itemGroup.add(stem);

          const topG = new THREE.CylinderGeometry(item.width * 0.45, item.width * 0.45, 0.04, 24);
          const top = new THREE.Mesh(topG, blackMat);
          top.position.y = item.height;
          itemGroup.add(top);

          // 2 High Stools
          for (let sx of [-item.width * 0.45, item.width * 0.45]) {
            const stoolStemG = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 12);
            const stoolStem = new THREE.Mesh(stoolStemG, chromeMat);
            stoolStem.position.set(sx, 0.375, 0);
            itemGroup.add(stoolStem);

            const stoolSeatG = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16);
            const stoolSeat = new THREE.Mesh(stoolSeatG, blackMat);
            stoolSeat.position.set(sx, 0.78, 0);
            itemGroup.add(stoolSeat);
          }
          break;
        }

        case 'product_podium': {
          // White lacquer pedestal with LED glowing base ring
          const podG = new THREE.BoxGeometry(item.width, item.height, item.depth);
          const podMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 });
          const pod = new THREE.Mesh(podG, podMat);
          pod.position.y = item.height / 2;
          pod.castShadow = true;
          itemGroup.add(pod);

          // Glow base
          const glowG = new THREE.BoxGeometry(item.width + 0.04, 0.05, item.depth + 0.04);
          const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(brandColor) });
          const glow = new THREE.Mesh(glowG, glowMat);
          glow.position.y = 0.025;
          itemGroup.add(glow);

          // Acrylic glass vitrine cap
          const glassCapG = new THREE.BoxGeometry(item.width * 0.9, 0.3, item.depth * 0.9);
          const capMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.05 });
          const cap = new THREE.Mesh(glassCapG, capMat);
          cap.position.y = item.height + 0.15;
          itemGroup.add(cap);
          break;
        }

        case 'shelving_rack': {
          const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
          const shelfMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });

          // Vertical posts
          for (let x of [-item.width / 2 + 0.03, item.width / 2 - 0.03]) {
            for (let z of [-item.depth / 2 + 0.03, item.depth / 2 - 0.03]) {
              const postG = new THREE.CylinderGeometry(0.02, 0.02, item.height, 8);
              const post = new THREE.Mesh(postG, frameMat);
              post.position.set(x, item.height / 2, z);
              itemGroup.add(post);
            }
          }

          // 4 Tiers of shelves
          for (let i = 1; i <= 4; i++) {
            const shelfY = (i * item.height) / 4.2;
            const shelfG = new THREE.BoxGeometry(item.width, 0.03, item.depth);
            const shelf = new THREE.Mesh(shelfG, shelfMat);
            shelf.position.y = shelfY;
            shelf.castShadow = true;
            itemGroup.add(shelf);
          }
          break;
        }

        case 'planter_greenery': {
          // Planter trough box
          const boxG = new THREE.BoxGeometry(item.width, item.height * 0.6, item.depth);
          const boxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
          const box = new THREE.Mesh(boxG, boxMat);
          box.position.y = (item.height * 0.6) / 2;
          box.castShadow = true;
          itemGroup.add(box);

          // Organic 3D foliage bushes
          const numBush = Math.max(3, Math.floor(item.width / 0.35));
          for (let i = 0; i < numBush; i++) {
            const bx = -item.width / 2 + ((i + 0.5) * item.width) / numBush;
            const bushG = new THREE.DodecahedronGeometry(0.22, 1);
            const bushMat = new THREE.MeshStandardMaterial({
              color: i % 2 === 0 ? 0x16a34a : 0x22c55e,
              roughness: 0.9,
            });
            const bush = new THREE.Mesh(bushG, bushMat);
            bush.position.set(bx, item.height * 0.7, 0);
            bush.scale.set(1, 1.2, 0.9);
            bush.castShadow = true;
            itemGroup.add(bush);
          }
          break;
        }

        case 'spotlight_rack': {
          const metalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 });
          // Base
          const baseG = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
          const base = new THREE.Mesh(baseG, metalMat);
          base.position.y = 0.025;
          itemGroup.add(base);

          // Pole
          const poleG = new THREE.CylinderGeometry(0.025, 0.025, item.height, 12);
          const pole = new THREE.Mesh(poleG, metalMat);
          pole.position.y = item.height / 2;
          itemGroup.add(pole);

          // Twin Spotlights on top
          for (let rot of [-Math.PI / 6, Math.PI / 6]) {
            const spotCanG = new THREE.CylinderGeometry(0.06, 0.09, 0.18, 16);
            const spotCan = new THREE.Mesh(spotCanG, metalMat);
            spotCan.position.set(0, item.height - 0.1, 0);
            spotCan.rotation.x = Math.PI / 3;
            spotCan.rotation.y = rot;
            itemGroup.add(spotCan);
          }
          break;
        }

        case 'truss_arch': {
          const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
          // 2 Upright towers
          for (let tx of [-item.width / 2 + 0.15, item.width / 2 - 0.15]) {
            const towerG = new THREE.BoxGeometry(0.25, item.height, 0.25);
            const tower = new THREE.Mesh(towerG, trussMat);
            tower.position.set(tx, item.height / 2, 0);
            tower.castShadow = true;
            itemGroup.add(tower);
          }
          // Top cross span
          const spanG = new THREE.BoxGeometry(item.width, 0.25, 0.25);
          const span = new THREE.Mesh(spanG, trussMat);
          span.position.set(0, item.height - 0.12, 0);
          span.castShadow = true;
          itemGroup.add(span);
          break;
        }

        default: {
          // Generic placeholder block
          const blockG = new THREE.BoxGeometry(item.width, item.height, item.depth);
          const blockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
          const block = new THREE.Mesh(blockG, blockMat);
          block.position.y = item.height / 2;
          itemGroup.add(block);
          break;
        }
      }

      // Selection ring indicator
      if (isSelected) {
        const ringG = new THREE.RingGeometry(Math.max(item.width, item.depth) * 0.55, Math.max(item.width, item.depth) * 0.65, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringG, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = platformThick + 0.02;
        itemGroup.add(ring);
      }

      // Position in booth coordinates (x, platformThick, z)
      itemGroup.position.set(item.x, platformThick, item.z);
      itemGroup.rotation.y = THREE.MathUtils.degToRad(item.rotation || 0);

      // Attach item metadata for Raycasting click selection
      itemGroup.userData = { itemId: item.id, itemName: item.name };

      boothGroup.add(itemGroup);
      itemMeshesMapRef.current.set(item.id, itemGroup);
    });
  }, [config, items, selectedItemId, generateTexture]);

  // Set Camera Preset
  const setCameraPreset = (preset: CameraPreset) => {
    setCurrentCameraPreset(preset);
    const state = controlsStateRef.current;
    state.autoRotate = false;
    setAutoRotate(false);

    const boothHypot = Math.sqrt(config.width * config.width + config.depth * config.depth);

    if (preset === 'iso') {
      state.theta = THREE.MathUtils.degToRad(35);
      state.phi = THREE.MathUtils.degToRad(55);
      state.distance = Math.max(boothHypot * 1.6, 9);
      state.target.set(0, 1.2, 0);
    } else if (preset === 'walk') {
      // Eye-level visitor perspective entering from front aisle
      state.theta = THREE.MathUtils.degToRad(0);
      state.phi = THREE.MathUtils.degToRad(84);
      state.distance = config.depth * 0.9 + 2.5;
      state.target.set(0, 1.4, 0);
    } else if (preset === 'front') {
      // Direct front elevation
      state.theta = THREE.MathUtils.degToRad(0);
      state.phi = THREE.MathUtils.degToRad(75);
      state.distance = Math.max(config.width * 1.4, 8);
      state.target.set(0, 1.5, 0);
    } else if (preset === 'top') {
      // Orthogonal top-down architectural layout view
      state.theta = THREE.MathUtils.degToRad(0);
      state.phi = THREE.MathUtils.degToRad(3);
      state.distance = Math.max(boothHypot * 1.5, 11);
      state.target.set(0, 0, 0);
    }
  };

  // Toggle Turntable Auto-rotate
  const toggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    controlsStateRef.current.autoRotate = next;
  };

  // Interactive OrbitControls Handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    controlsStateRef.current.isDragging = true;
    controlsStateRef.current.prevX = e.clientX;
    controlsStateRef.current.prevY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!controlsStateRef.current.isDragging) return;
    const deltaX = e.clientX - controlsStateRef.current.prevX;
    const deltaY = e.clientY - controlsStateRef.current.prevY;
    controlsStateRef.current.prevX = e.clientX;
    controlsStateRef.current.prevY = e.clientY;

    const state = controlsStateRef.current;
    state.theta -= deltaX * 0.007;
    state.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.04, state.phi - deltaY * 0.007));
  };

  const handleMouseUp = () => {
    controlsStateRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const state = controlsStateRef.current;
    state.distance = Math.max(3.5, Math.min(28, state.distance + e.deltaY * 0.015));
  };

  // Touch Support
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.dist = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;

      const state = controlsStateRef.current;
      state.theta -= deltaX * 0.008;
      state.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.04, state.phi - deltaY * 0.008));
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const delta = touchStartRef.current.dist - currentDist;
      touchStartRef.current.dist = currentDist;

      const state = controlsStateRef.current;
      state.distance = Math.max(3.5, Math.min(28, state.distance + delta * 0.03));
    }
  };

  // Raycast click to select item in 3D
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!canvas || !camera || !scene) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects(boothGroupRef.current?.children || [], true);
    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      while (hitObj && !hitObj.userData.itemId && hitObj.parent) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData.itemId) {
        onSelectItem(hitObj.userData.itemId);
        setCommentTarget(hitObj.userData.itemName || 'Selected Element');
        return;
      }
    }
    // clicked blank ground
    onSelectItem(null);
  };

  // Snapshot high-res render download
  const handleDownloadRender = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Render snapshot
    const link = document.createElement('a');
    link.download = `booth-3d-render-${config.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const selectedItemObj = items.find((it) => it.id === selectedItemId);

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[540px] lg:h-[620px]'} ${className}`}
    >
      {/* 3D Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={handleCanvasClick}
      />

      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Live Status Badge & Camera Presets */}
        <div className="flex items-center gap-2 pointer-events-auto bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700/60 shadow-lg text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Real-Time 3D Sync</span>
          </div>

          <span className="text-zinc-600">|</span>

          {/* Camera Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCameraPreset('iso')}
              title="Isometric 3D Angle"
              className={`px-2 py-1 rounded-lg transition-colors ${currentCameraPreset === 'iso' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
              Isometric
            </button>
            <button
              onClick={() => setCameraPreset('walk')}
              title="Eye-Level Visitor Walkthrough"
              className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${currentCameraPreset === 'walk' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Walk-Through</span>
            </button>
            <button
              onClick={() => setCameraPreset('front')}
              title="Front Elevation"
              className={`px-2 py-1 rounded-lg transition-colors ${currentCameraPreset === 'front' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
              Front
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              title="Top-Down Plan"
              className={`px-2 py-1 rounded-lg transition-colors ${currentCameraPreset === 'top' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
              Top Plan
            </button>
          </div>
        </div>

        {/* Action Controls: Lighting, Turntable, Snapshot, Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-zinc-900/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-zinc-700/60 shadow-lg text-xs">
          {/* Turntable Auto-rotate */}
          <button
            onClick={toggleAutoRotate}
            title={autoRotate ? 'Stop Turntable' : 'Auto-Rotate Turntable'}
            className={`p-1.5 rounded-lg transition-colors ${autoRotate ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* Lighting Mode Picker */}
          <div className="flex items-center border-x border-zinc-800 px-1 mx-1 gap-1">
            <button
              onClick={() => setLightingTheme('hall')}
              title="Exhibition Hall Daylight"
              className={`p-1.5 rounded-lg transition-colors ${lightingTheme === 'hall' ? 'bg-zinc-800 text-amber-300' : 'text-zinc-400 hover:text-white'}`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLightingTheme('spotlight')}
              title="Dramatic Spotlights"
              className={`p-1.5 rounded-lg transition-colors ${lightingTheme === 'spotlight' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLightingTheme('evening')}
              title="Warm VIP Lounge Atmosphere"
              className={`p-1.5 rounded-lg transition-colors ${lightingTheme === 'evening' ? 'bg-zinc-800 text-purple-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Client Review Mode Toggle */}
          <button
            onClick={() => setIsClientMode(!isClientMode)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              isClientMode 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Client Review</span>
          </button>

          {/* Snapshot PNG */}
          <button
            onClick={handleDownloadRender}
            title="Download High-Res 3D Snapshot"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D Workspace'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Selected Element Quick Inspector Overlay */}
      {selectedItemObj && (
        <div className="absolute bottom-4 left-4 pointer-events-auto bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/40 shadow-2xl max-w-xs text-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-semibold text-white truncate">{selectedItemObj.name}</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
              {selectedItemObj.category.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-zinc-400 font-mono text-[11px] mb-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800">
            <div>
              <span className="text-zinc-500 block text-[9px]">SIZE</span>
              {selectedItemObj.width}m × {selectedItemObj.depth}m
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px]">ROTATION</span>
              {selectedItemObj.rotation}°
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px]">POWER</span>
              {selectedItemObj.powerWatts}W
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCommentTarget(selectedItemObj.name);
                setIsClientMode(true);
              }}
              className="w-full py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Pin Client Feedback</span>
            </button>
          </div>
        </div>
      )}

      {/* Client Review Floating Drawer (When Active) */}
      {isClientMode && (
        <div className="absolute top-14 right-3 w-80 max-h-[82%] bg-zinc-900/95 backdrop-blur-lg border border-emerald-500/30 rounded-xl shadow-2xl p-4 flex flex-col z-20 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Client Review Room</h4>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">{feedbacks.length} notes</span>
          </div>

          {/* Quick Comment Input */}
          <div className="mb-3">
            <div className="text-[11px] text-zinc-400 mb-1 flex items-center justify-between">
              <span>Target: <strong className="text-emerald-300">{commentTarget || 'General Booth Layout'}</strong></span>
              {commentTarget && (
                <button onClick={() => setCommentTarget(null)} className="text-zinc-500 hover:text-zinc-300 text-[10px]">
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={quickFeedbackText}
                onChange={(e) => setQuickFeedbackText(e.target.value)}
                placeholder="e.g., Increase clearance for wheelchairs..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickFeedbackText.trim()) {
                    // add note
                    setQuickFeedbackText('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (quickFeedbackText.trim()) {
                    setQuickFeedbackText('');
                  }
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
              >
                Post
              </button>
            </div>
          </div>

          {/* Feedbacks Stream */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <img src={fb.avatar} alt={fb.author} className="w-4 h-4 rounded-full object-cover" />
                    <span className="font-semibold text-zinc-200">{fb.author}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{fb.time}</span>
                </div>
                {fb.targetItemName && (
                  <span className="inline-block mb-1 text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    📍 {fb.targetItemName}
                  </span>
                )}
                <p className="text-zinc-300 leading-relaxed text-[11px]">{fb.message}</p>
                <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-zinc-800/60 text-[10px]">
                  <span className="text-zinc-500">{fb.role}</span>
                  <span className={`px-1.5 py-0.5 rounded capitalize ${fb.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {fb.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtle Hint Bar */}
      {showHelperTips && (
        <div className="absolute bottom-3 right-3 pointer-events-auto bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
          <span>💡 <strong>Click + Drag</strong> to rotate · <strong>Scroll</strong> to zoom · <strong>Click objects</strong> to inspect</span>
          <button onClick={() => setShowHelperTips(false)} className="text-zinc-500 hover:text-zinc-300 ml-1">✕</button>
        </div>
      )}
    </div>
  );
};
