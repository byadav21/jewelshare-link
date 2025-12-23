import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Diamond color grades with accurate spectral absorption
const COLOR_GRADES = {
  D: { hue: 210, saturation: 0.03, lightness: 0.98, warmth: 0 },
  E: { hue: 210, saturation: 0.02, lightness: 0.97, warmth: 0.02 },
  F: { hue: 200, saturation: 0.02, lightness: 0.96, warmth: 0.04 },
  G: { hue: 50, saturation: 0.04, lightness: 0.95, warmth: 0.08 },
  H: { hue: 48, saturation: 0.08, lightness: 0.94, warmth: 0.12 },
  I: { hue: 46, saturation: 0.12, lightness: 0.92, warmth: 0.18 },
  J: { hue: 44, saturation: 0.18, lightness: 0.90, warmth: 0.25 },
  K: { hue: 42, saturation: 0.25, lightness: 0.88, warmth: 0.35 },
  L: { hue: 40, saturation: 0.32, lightness: 0.85, warmth: 0.42 },
  M: { hue: 38, saturation: 0.38, lightness: 0.82, warmth: 0.50 },
  N: { hue: 36, saturation: 0.44, lightness: 0.78, warmth: 0.58 },
  O: { hue: 34, saturation: 0.48, lightness: 0.75, warmth: 0.65 },
  P: { hue: 32, saturation: 0.52, lightness: 0.72, warmth: 0.70 },
  Q: { hue: 30, saturation: 0.55, lightness: 0.70, warmth: 0.75 },
  R: { hue: 28, saturation: 0.58, lightness: 0.68, warmth: 0.78 },
  S: { hue: 26, saturation: 0.60, lightness: 0.66, warmth: 0.82 },
  T: { hue: 24, saturation: 0.62, lightness: 0.64, warmth: 0.85 },
  U: { hue: 22, saturation: 0.64, lightness: 0.62, warmth: 0.88 },
  V: { hue: 20, saturation: 0.66, lightness: 0.60, warmth: 0.90 },
  W: { hue: 18, saturation: 0.68, lightness: 0.58, warmth: 0.92 },
  X: { hue: 16, saturation: 0.70, lightness: 0.56, warmth: 0.94 },
  Y: { hue: 14, saturation: 0.72, lightness: 0.54, warmth: 0.96 },
  Z: { hue: 12, saturation: 0.75, lightness: 0.50, warmth: 1.0 },
};

// Clarity grades with inclusion parameters
const CLARITY_GRADES = {
  FL: { count: 0, maxSize: 0, visibility: 0, centerChance: 0, carbonChance: 0 },
  IF: { count: 0, maxSize: 0, visibility: 0, centerChance: 0, carbonChance: 0 },
  VVS1: { count: 1, maxSize: 0.012, visibility: 0.12, centerChance: 0.05, carbonChance: 0 },
  VVS2: { count: 2, maxSize: 0.018, visibility: 0.2, centerChance: 0.1, carbonChance: 0 },
  VS1: { count: 3, maxSize: 0.025, visibility: 0.35, centerChance: 0.15, carbonChance: 0.05 },
  VS2: { count: 5, maxSize: 0.035, visibility: 0.5, centerChance: 0.25, carbonChance: 0.1 },
  SI1: { count: 7, maxSize: 0.05, visibility: 0.65, centerChance: 0.4, carbonChance: 0.2 },
  SI2: { count: 10, maxSize: 0.07, visibility: 0.8, centerChance: 0.55, carbonChance: 0.3 },
  I1: { count: 15, maxSize: 0.1, visibility: 0.95, centerChance: 0.7, carbonChance: 0.5 },
  I2: { count: 22, maxSize: 0.15, visibility: 1.0, centerChance: 0.85, carbonChance: 0.7 },
  I3: { count: 30, maxSize: 0.22, visibility: 1.0, centerChance: 0.95, carbonChance: 0.85 },
};

type InclusionType = 'pinpoint' | 'feather' | 'cloud' | 'crystal' | 'needle' | 'carbon';

interface Inclusion {
  type: InclusionType;
  position: THREE.Vector3;
  size: number;
  rotation: THREE.Euler;
  opacity: number;
  isCarbon: boolean;
}

// Generate realistic inclusions based on clarity grade
const generateInclusions = (clarityGrade: keyof typeof CLARITY_GRADES, seed: number): Inclusion[] => {
  const params = CLARITY_GRADES[clarityGrade];
  if (params.count === 0) return [];

  const inclusions: Inclusion[] = [];
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const inclusionTypes: InclusionType[] = ['pinpoint', 'feather', 'cloud', 'crystal', 'needle'];

  for (let i = 0; i < params.count; i++) {
    const s = seed + i * 137.5;
    const isCarbon = random(s + 1) < params.carbonChance;
    const isCenter = random(s + 2) < params.centerChance;
    
    const radius = isCenter ? random(s + 3) * 0.25 : 0.25 + random(s + 3) * 0.45;
    const theta = random(s + 4) * Math.PI * 2;
    const phi = random(s + 5) * Math.PI;
    
    const position = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) * 0.7,
      radius * Math.sin(phi) * Math.sin(theta)
    );

    const type = isCarbon ? 'carbon' : inclusionTypes[Math.floor(random(s + 6) * inclusionTypes.length)];
    const size = params.maxSize * (0.4 + random(s + 7) * 0.6);
    
    inclusions.push({
      type,
      position,
      size,
      rotation: new THREE.Euler(
        random(s + 8) * Math.PI,
        random(s + 9) * Math.PI,
        random(s + 10) * Math.PI
      ),
      opacity: params.visibility * (0.6 + random(s + 11) * 0.4),
      isCarbon,
    });
  }

  return inclusions;
};

// Create realistic brilliant cut geometry with proper faceting
const createBrilliantCutGeometry = (): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  
  const tableRatio = 0.56;
  const crownHeight = 0.16;
  const girdleRadius = 1.0;
  const pavilionDepth = 0.43;
  const culetSize = 0.01;
  
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  
  const addVertex = (x: number, y: number, z: number) => {
    vertices.push(x, y, z);
    return vertices.length / 3 - 1;
  };
  
  // Table center
  const tableY = crownHeight;
  const tableCenterIdx = addVertex(0, tableY, 0);
  
  // Table vertices (8 points)
  const tableVertices: number[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const idx = addVertex(
      Math.cos(angle) * tableRatio,
      tableY,
      Math.sin(angle) * tableRatio
    );
    tableVertices.push(idx);
  }
  
  // Crown star vertices (8 points between table and bezel)
  const starVertices: number[] = [];
  const starRadius = tableRatio + (girdleRadius - tableRatio) * 0.35;
  const starY = crownHeight * 0.55;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const idx = addVertex(
      Math.cos(angle) * starRadius,
      starY,
      Math.sin(angle) * starRadius
    );
    starVertices.push(idx);
  }
  
  // Upper girdle vertices (16 points)
  const upperGirdleVertices: number[] = [];
  const upperGirdleY = 0.02;
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    const idx = addVertex(
      Math.cos(angle) * girdleRadius,
      upperGirdleY,
      Math.sin(angle) * girdleRadius
    );
    upperGirdleVertices.push(idx);
  }
  
  // Lower girdle vertices (16 points)
  const lowerGirdleVertices: number[] = [];
  const lowerGirdleY = -0.02;
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    const idx = addVertex(
      Math.cos(angle) * girdleRadius,
      lowerGirdleY,
      Math.sin(angle) * girdleRadius
    );
    lowerGirdleVertices.push(idx);
  }
  
  // Pavilion main vertices (8 points)
  const pavilionMainVertices: number[] = [];
  const pavilionMainRadius = girdleRadius * 0.45;
  const pavilionMainY = -pavilionDepth * 0.55;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const idx = addVertex(
      Math.cos(angle) * pavilionMainRadius,
      pavilionMainY,
      Math.sin(angle) * pavilionMainRadius
    );
    pavilionMainVertices.push(idx);
  }
  
  // Culet
  const culetIdx = addVertex(0, -pavilionDepth, 0);
  
  // === Build faces ===
  
  // Table facet (octagon)
  for (let i = 0; i < 8; i++) {
    indices.push(tableCenterIdx, tableVertices[i], tableVertices[(i + 1) % 8]);
  }
  
  // Crown star facets
  for (let i = 0; i < 8; i++) {
    indices.push(tableVertices[i], starVertices[i], tableVertices[(i + 1) % 8]);
  }
  
  // Crown bezel facets (kite-shaped, triangulated)
  for (let i = 0; i < 8; i++) {
    const nextI = (i + 1) % 8;
    const girdleIdx1 = upperGirdleVertices[i * 2];
    const girdleIdx2 = upperGirdleVertices[(i * 2 + 1) % 16];
    const girdleIdx3 = upperGirdleVertices[(i * 2 + 2) % 16];
    
    // Upper bezel triangles
    indices.push(starVertices[i], girdleIdx1, girdleIdx2);
    indices.push(starVertices[i], girdleIdx2, starVertices[nextI]);
    indices.push(starVertices[nextI], girdleIdx2, girdleIdx3);
  }
  
  // Girdle band
  for (let i = 0; i < 16; i++) {
    const next = (i + 1) % 16;
    indices.push(upperGirdleVertices[i], lowerGirdleVertices[i], upperGirdleVertices[next]);
    indices.push(upperGirdleVertices[next], lowerGirdleVertices[i], lowerGirdleVertices[next]);
  }
  
  // Pavilion main facets
  for (let i = 0; i < 8; i++) {
    const nextI = (i + 1) % 8;
    const girdleIdx1 = lowerGirdleVertices[i * 2];
    const girdleIdx2 = lowerGirdleVertices[(i * 2 + 1) % 16];
    const girdleIdx3 = lowerGirdleVertices[(i * 2 + 2) % 16];
    
    // Main pavilion triangles
    indices.push(girdleIdx1, pavilionMainVertices[i], girdleIdx2);
    indices.push(girdleIdx2, pavilionMainVertices[i], pavilionMainVertices[nextI]);
    indices.push(girdleIdx2, pavilionMainVertices[nextI], girdleIdx3);
  }
  
  // Pavilion lower facets to culet
  for (let i = 0; i < 8; i++) {
    const nextI = (i + 1) % 8;
    indices.push(pavilionMainVertices[i], culetIdx, pavilionMainVertices[nextI]);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

// Individual inclusion component with animation
const InclusionMesh = ({ inclusion, microscopeMode }: { inclusion: Inclusion; microscopeMode: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && inclusion.type === 'cloud') {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });
  
  const geometry = useMemo(() => {
    const scale = microscopeMode ? 2.2 : 1;
    switch (inclusion.type) {
      case 'pinpoint':
        return new THREE.SphereGeometry(inclusion.size * 0.4 * scale, 12, 12);
      case 'feather':
        const shape = new THREE.Shape();
        const w = inclusion.size * 1.5 * scale;
        const h = inclusion.size * 0.8 * scale;
        shape.moveTo(0, 0);
        shape.bezierCurveTo(w * 0.3, h * 0.5, w * 0.7, h * 0.5, w, 0);
        shape.bezierCurveTo(w * 0.7, -h * 0.3, w * 0.3, -h * 0.3, 0, 0);
        return new THREE.ShapeGeometry(shape);
      case 'cloud':
        const cloudGeo = new THREE.BufferGeometry();
        const cloudPositions: number[] = [];
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const r = inclusion.size * scale * (0.3 + Math.random() * 0.4);
          cloudPositions.push(
            Math.cos(angle) * r,
            (Math.random() - 0.5) * inclusion.size * scale * 0.5,
            Math.sin(angle) * r
          );
        }
        cloudGeo.setAttribute('position', new THREE.Float32BufferAttribute(cloudPositions, 3));
        return new THREE.SphereGeometry(inclusion.size * 0.8 * scale, 8, 8);
      case 'crystal':
        return new THREE.OctahedronGeometry(inclusion.size * 0.6 * scale);
      case 'needle':
        return new THREE.CylinderGeometry(0.003 * scale, 0.003 * scale, inclusion.size * 2.5 * scale, 8);
      case 'carbon':
        return new THREE.IcosahedronGeometry(inclusion.size * 0.55 * scale, 0);
      default:
        return new THREE.SphereGeometry(inclusion.size * scale, 8, 8);
    }
  }, [inclusion.type, inclusion.size, microscopeMode]);

  const material = useMemo(() => {
    const opacityMultiplier = microscopeMode ? 1.4 : 1;
    
    if (inclusion.isCarbon) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0a0a0a),
        metalness: 0.2,
        roughness: 0.9,
        transparent: true,
        opacity: Math.min(inclusion.opacity * opacityMultiplier, 0.95),
      });
    }
    
    const baseColor = inclusion.type === 'feather' ? 0xffffff : 
                     inclusion.type === 'cloud' ? 0xeeeeee : 0xfafafa;
    
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(baseColor),
      metalness: 0,
      roughness: inclusion.type === 'feather' ? 0.4 : 0.15,
      transmission: inclusion.type === 'cloud' ? 0.2 : 0.5,
      thickness: 0.05,
      transparent: true,
      opacity: inclusion.opacity * opacityMultiplier * 0.8,
    });
  }, [inclusion, microscopeMode]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={inclusion.position}
      rotation={inclusion.rotation}
    />
  );
};

// Sparkle effect component
const DiamondSparkles = ({ intensity = 1 }: { intensity?: number }) => {
  const sparkleRef = useRef<THREE.Points>(null);
  const [time, setTime] = useState(0);
  
  useFrame((state) => {
    setTime(state.clock.elapsedTime);
    if (sparkleRef.current) {
      sparkleRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <Sparkles
      ref={sparkleRef}
      count={30}
      scale={2.5}
      size={4 * intensity}
      speed={0.4}
      opacity={0.6}
      color="#ffffff"
    />
  );
};

// Main diamond mesh component
const DiamondMesh = ({
  colorGrade,
  clarityGrade,
  autoRotate,
  microscopeMode,
  viewMode,
  seed = 12345,
}: {
  colorGrade: keyof typeof COLOR_GRADES;
  clarityGrade: keyof typeof CLARITY_GRADES;
  autoRotate: boolean;
  microscopeMode: boolean;
  viewMode: 'faceUp' | 'side' | 'pavilion';
  seed?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const diamondRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => createBrilliantCutGeometry(), []);
  
  const inclusions = useMemo(() => 
    generateInclusions(clarityGrade, seed), 
    [clarityGrade, seed]
  );

  // Calculate diamond color based on grade
  const diamondColor = useMemo(() => {
    const grade = COLOR_GRADES[colorGrade];
    return new THREE.Color().setHSL(grade.hue / 360, grade.saturation, grade.lightness);
  }, [colorGrade]);

  // Diamond material with physically accurate properties
  const material = useMemo(() => {
    const grade = COLOR_GRADES[colorGrade];
    
    return new THREE.MeshPhysicalMaterial({
      color: diamondColor,
      metalness: 0,
      roughness: 0.0,
      transmission: 0.96 - grade.warmth * 0.08,
      thickness: 2.0,
      ior: 2.417,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: microscopeMode ? 2 : 4,
      transparent: true,
      opacity: 1,
      attenuationDistance: 0.5,
      attenuationColor: diamondColor,
      sheen: 0.3,
      sheenRoughness: 0.2,
      sheenColor: new THREE.Color(0xffffff),
      specularIntensity: 1,
      specularColor: new THREE.Color(0xffffff),
    });
  }, [diamondColor, colorGrade, microscopeMode]);

  // Set initial rotation based on view mode
  useEffect(() => {
    if (groupRef.current) {
      switch (viewMode) {
        case 'faceUp':
          groupRef.current.rotation.set(0, 0, 0);
          break;
        case 'side':
          groupRef.current.rotation.set(Math.PI / 3.5, 0, 0);
          break;
        case 'pavilion':
          groupRef.current.rotation.set(Math.PI, 0, 0);
          break;
      }
    }
  }, [viewMode]);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.4;
    }
    
    // Subtle breathing animation for realism
    if (diamondRef.current && !microscopeMode) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.002;
      diamondRef.current.scale.setScalar(scale);
    }
  });

  const scale = microscopeMode ? 1.6 : 1.1;

  return (
    <group ref={groupRef} scale={scale}>
      <mesh
        ref={diamondRef}
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
      
      {/* Render inclusions inside the diamond */}
      <group scale={0.85}>
        {inclusions.map((inclusion, i) => (
          <InclusionMesh 
            key={i} 
            inclusion={inclusion} 
            microscopeMode={microscopeMode}
          />
        ))}
      </group>
      
      {/* Sparkle effects */}
      {!microscopeMode && <DiamondSparkles intensity={1 - (COLOR_GRADES[colorGrade]?.warmth || 0) * 0.5} />}
    </group>
  );
};

// Enhanced lighting setup
const GemologicalLighting = ({ microscopeMode }: { microscopeMode: boolean }) => {
  const lightsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lightsRef.current && !microscopeMode) {
      lightsRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });
  
  return (
    <group ref={lightsRef}>
      {/* Main key light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={microscopeMode ? 2 : 1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#ffffff"
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-5, 8, -5]}
        intensity={microscopeMode ? 1.5 : 1}
        color="#f0f8ff"
      />
      
      {/* Rim lights for fire effect */}
      <pointLight position={[3, 2, 3]} intensity={0.8} color="#fff5e6" distance={10} />
      <pointLight position={[-3, 2, -3]} intensity={0.8} color="#e6f0ff" distance={10} />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#fff0f5" distance={8} />
      
      {/* Microscope ring light */}
      {microscopeMode && (
        <>
          <pointLight position={[2, 4, 2]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-2, 4, 2]} intensity={1.2} color="#ffffff" />
          <pointLight position={[2, 4, -2]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-2, 4, -2]} intensity={1.2} color="#ffffff" />
        </>
      )}
      
      {/* Ambient fill */}
      <ambientLight intensity={microscopeMode ? 0.5 : 0.35} />
      
      {/* Rainbow dispersion spotlights */}
      {!microscopeMode && (
        <>
          <spotLight
            position={[4, 6, 2]}
            angle={0.25}
            penumbra={0.8}
            intensity={0.6}
            color="#ff6b6b"
          />
          <spotLight
            position={[-2, 6, 4]}
            angle={0.25}
            penumbra={0.8}
            intensity={0.5}
            color="#4ecdc4"
          />
          <spotLight
            position={[0, 6, -4]}
            angle={0.25}
            penumbra={0.8}
            intensity={0.5}
            color="#a855f7"
          />
        </>
      )}
    </group>
  );
};

// Camera controller for view modes
const CameraController = ({ viewMode, microscopeMode }: { viewMode: string; microscopeMode: boolean }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const distance = microscopeMode ? 2.2 : 3.5;
    switch (viewMode) {
      case 'faceUp':
        camera.position.set(0, distance, 0.5);
        break;
      case 'side':
        camera.position.set(distance * 0.8, distance * 0.4, distance * 0.8);
        break;
      case 'pavilion':
        camera.position.set(0, -distance, 0.5);
        break;
    }
    camera.lookAt(0, 0, 0);
  }, [viewMode, microscopeMode, camera]);
  
  return null;
};

// Main component props
interface RealisticDiamond3DProps {
  colorGrade?: keyof typeof COLOR_GRADES;
  clarityGrade?: keyof typeof CLARITY_GRADES;
  autoRotate?: boolean;
  microscopeMode?: boolean;
  viewMode?: 'faceUp' | 'side' | 'pavilion';
  showControls?: boolean;
  seed?: number;
  className?: string;
}

const RealisticDiamond3D = ({
  colorGrade = 'G',
  clarityGrade = 'VS1',
  autoRotate = true,
  microscopeMode = false,
  viewMode = 'faceUp',
  showControls = true,
  seed = 12345,
  className = "",
}: RealisticDiamond3DProps) => {
  const bgGradient = microscopeMode 
    ? 'radial-gradient(circle at 50% 50%, #0d0d1a 0%, #000000 100%)'
    : 'radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 50%, #020617 100%)';
  
  return (
    <div 
      className={`w-full h-full min-h-[400px] rounded-xl overflow-hidden ${className}`}
      style={{ background: bgGradient }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.5, 0.5], fov: microscopeMode ? 28 : 38 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <CameraController viewMode={viewMode} microscopeMode={microscopeMode} />
        <GemologicalLighting microscopeMode={microscopeMode} />
        
        <DiamondMesh
          colorGrade={colorGrade}
          clarityGrade={clarityGrade}
          autoRotate={autoRotate}
          microscopeMode={microscopeMode}
          viewMode={viewMode}
          seed={seed}
        />
        
        {/* Reflective floor */}
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.5}
          scale={8}
          blur={2.5}
          far={4}
        />
        
        {/* HDR Environment for realistic reflections */}
        <Environment preset={microscopeMode ? "warehouse" : "city"} />
        
        {showControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={false}
            minDistance={1.5}
            maxDistance={10}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            dampingFactor={0.05}
            enableDamping
          />
        )}
      </Canvas>
    </div>
  );
};

export { COLOR_GRADES, CLARITY_GRADES };
export default RealisticDiamond3D;
