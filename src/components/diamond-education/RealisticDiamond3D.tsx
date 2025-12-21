import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Diamond color grades with accurate spectral absorption
const COLOR_GRADES = {
  D: { hue: 0, saturation: 0, lightness: 1.0, warmth: 0 },
  E: { hue: 0, saturation: 0, lightness: 0.99, warmth: 0.02 },
  F: { hue: 0, saturation: 0, lightness: 0.98, warmth: 0.04 },
  G: { hue: 45, saturation: 0.03, lightness: 0.97, warmth: 0.08 },
  H: { hue: 45, saturation: 0.06, lightness: 0.96, warmth: 0.12 },
  I: { hue: 48, saturation: 0.10, lightness: 0.95, warmth: 0.18 },
  J: { hue: 50, saturation: 0.15, lightness: 0.94, warmth: 0.25 },
  K: { hue: 52, saturation: 0.22, lightness: 0.92, warmth: 0.35 },
  L: { hue: 52, saturation: 0.28, lightness: 0.90, warmth: 0.42 },
  M: { hue: 50, saturation: 0.35, lightness: 0.88, warmth: 0.50 },
  N: { hue: 48, saturation: 0.42, lightness: 0.85, warmth: 0.58 },
  O: { hue: 46, saturation: 0.48, lightness: 0.82, warmth: 0.65 },
  P: { hue: 44, saturation: 0.52, lightness: 0.80, warmth: 0.70 },
  Q: { hue: 42, saturation: 0.55, lightness: 0.78, warmth: 0.75 },
  R: { hue: 40, saturation: 0.58, lightness: 0.76, warmth: 0.78 },
  S: { hue: 38, saturation: 0.60, lightness: 0.74, warmth: 0.82 },
  T: { hue: 36, saturation: 0.62, lightness: 0.72, warmth: 0.85 },
  U: { hue: 34, saturation: 0.64, lightness: 0.70, warmth: 0.88 },
  V: { hue: 32, saturation: 0.66, lightness: 0.68, warmth: 0.90 },
  W: { hue: 30, saturation: 0.68, lightness: 0.66, warmth: 0.92 },
  X: { hue: 28, saturation: 0.70, lightness: 0.64, warmth: 0.94 },
  Y: { hue: 26, saturation: 0.72, lightness: 0.62, warmth: 0.96 },
  Z: { hue: 24, saturation: 0.75, lightness: 0.60, warmth: 1.0 },
};

// Clarity grades with inclusion parameters
const CLARITY_GRADES = {
  FL: { count: 0, maxSize: 0, visibility: 0, centerChance: 0, carbonChance: 0 },
  IF: { count: 0, maxSize: 0, visibility: 0, centerChance: 0, carbonChance: 0 },
  VVS1: { count: 1, maxSize: 0.015, visibility: 0.15, centerChance: 0.05, carbonChance: 0 },
  VVS2: { count: 2, maxSize: 0.02, visibility: 0.25, centerChance: 0.1, carbonChance: 0 },
  VS1: { count: 3, maxSize: 0.03, visibility: 0.4, centerChance: 0.15, carbonChance: 0.05 },
  VS2: { count: 5, maxSize: 0.04, visibility: 0.55, centerChance: 0.25, carbonChance: 0.1 },
  SI1: { count: 7, maxSize: 0.06, visibility: 0.7, centerChance: 0.4, carbonChance: 0.2 },
  SI2: { count: 10, maxSize: 0.08, visibility: 0.85, centerChance: 0.55, carbonChance: 0.3 },
  I1: { count: 15, maxSize: 0.12, visibility: 1.0, centerChance: 0.7, carbonChance: 0.5 },
  I2: { count: 22, maxSize: 0.18, visibility: 1.0, centerChance: 0.85, carbonChance: 0.7 },
  I3: { count: 30, maxSize: 0.25, visibility: 1.0, centerChance: 0.95, carbonChance: 0.85 },
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
    
    // Position - center inclusions are more visible and problematic
    const radius = isCenter ? random(s + 3) * 0.3 : 0.3 + random(s + 3) * 0.5;
    const theta = random(s + 4) * Math.PI * 2;
    const phi = random(s + 5) * Math.PI;
    
    const position = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) * 0.8, // Flatten slightly for brilliant cut
      radius * Math.sin(phi) * Math.sin(theta)
    );

    const type = isCarbon ? 'carbon' : inclusionTypes[Math.floor(random(s + 6) * inclusionTypes.length)];
    const size = params.maxSize * (0.3 + random(s + 7) * 0.7);
    
    inclusions.push({
      type,
      position,
      size,
      rotation: new THREE.Euler(
        random(s + 8) * Math.PI,
        random(s + 9) * Math.PI,
        random(s + 10) * Math.PI
      ),
      opacity: params.visibility * (0.5 + random(s + 11) * 0.5),
      isCarbon,
    });
  }

  return inclusions;
};

// Brilliant cut diamond geometry with 57 facets
const createBrilliantCutGeometry = (): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  
  // Crown angles and pavilion angles for ideal cut
  const crownAngle = 34.5 * (Math.PI / 180);
  const pavilionAngle = 40.75 * (Math.PI / 180);
  const tableRatio = 0.57;
  const crownHeight = 0.162;
  const pavilionDepth = 0.431;
  const girdleThickness = 0.025;
  
  const vertices: number[] = [];
  const indices: number[] = [];
  
  // Table center
  const tableY = crownHeight + girdleThickness / 2;
  
  // Create crown (top part)
  // Table vertices (octagon)
  const tableVertices: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 + Math.PI / 8;
    tableVertices.push(new THREE.Vector3(
      Math.cos(angle) * tableRatio,
      tableY,
      Math.sin(angle) * tableRatio
    ));
  }
  
  // Girdle vertices (16-sided)
  const girdleVertices: THREE.Vector3[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    girdleVertices.push(new THREE.Vector3(
      Math.cos(angle),
      0,
      Math.sin(angle)
    ));
  }
  
  // Star facet vertices
  const starVertices: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const r = tableRatio + (1 - tableRatio) * 0.4;
    starVertices.push(new THREE.Vector3(
      Math.cos(angle) * r,
      tableY * 0.7,
      Math.sin(angle) * r
    ));
  }
  
  // Culet (bottom point)
  const culet = new THREE.Vector3(0, -pavilionDepth, 0);
  
  // Add all vertices
  const allVertices = [
    new THREE.Vector3(0, tableY, 0), // Table center - index 0
    ...tableVertices, // indices 1-8
    ...starVertices, // indices 9-16
    ...girdleVertices, // indices 17-32
    culet, // index 33
  ];
  
  allVertices.forEach(v => vertices.push(v.x, v.y, v.z));
  
  // Table facet (octagon)
  for (let i = 0; i < 8; i++) {
    indices.push(0, 1 + i, 1 + ((i + 1) % 8));
  }
  
  // Star facets
  for (let i = 0; i < 8; i++) {
    indices.push(1 + i, 9 + i, 1 + ((i + 1) % 8));
    indices.push(9 + i, 9 + ((i + 1) % 8), 1 + ((i + 1) % 8));
  }
  
  // Crown main facets (bezel facets) - connecting stars to girdle
  for (let i = 0; i < 8; i++) {
    const girdleIdx1 = 17 + i * 2;
    const girdleIdx2 = 17 + ((i * 2 + 1) % 16);
    const girdleIdx3 = 17 + ((i * 2 + 2) % 16);
    indices.push(9 + i, girdleIdx1, girdleIdx2);
    indices.push(9 + i, girdleIdx2, 9 + ((i + 1) % 8));
    indices.push(9 + ((i + 1) % 8), girdleIdx2, girdleIdx3);
  }
  
  // Pavilion facets
  for (let i = 0; i < 16; i++) {
    indices.push(33, 17 + ((i + 1) % 16), 17 + i);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

// Individual inclusion component
const InclusionMesh = ({ inclusion, microscopeMode }: { inclusion: Inclusion; microscopeMode: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const scale = microscopeMode ? 2.5 : 1;
    switch (inclusion.type) {
      case 'pinpoint':
        return new THREE.SphereGeometry(inclusion.size * 0.5 * scale, 8, 8);
      case 'feather':
        return new THREE.PlaneGeometry(inclusion.size * 2 * scale, inclusion.size * scale);
      case 'cloud':
        return new THREE.SphereGeometry(inclusion.size * scale, 6, 6);
      case 'crystal':
        return new THREE.OctahedronGeometry(inclusion.size * 0.7 * scale);
      case 'needle':
        return new THREE.CylinderGeometry(0.002 * scale, 0.002 * scale, inclusion.size * 3 * scale);
      case 'carbon':
        return new THREE.IcosahedronGeometry(inclusion.size * 0.6 * scale);
      default:
        return new THREE.SphereGeometry(inclusion.size * scale);
    }
  }, [inclusion.type, inclusion.size, microscopeMode]);

  const material = useMemo(() => {
    if (inclusion.isCarbon) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1a1a1a),
        metalness: 0.3,
        roughness: 0.8,
        transparent: true,
        opacity: inclusion.opacity * (microscopeMode ? 1.5 : 1),
      });
    }
    
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0,
      roughness: 0.1,
      transmission: inclusion.type === 'cloud' ? 0.3 : 0.6,
      thickness: 0.1,
      transparent: true,
      opacity: inclusion.opacity * (microscopeMode ? 1.2 : 0.7),
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
    if (grade.saturation === 0) {
      // Colorless grades (D-F) - slight blue tint
      const l = grade.lightness;
      return new THREE.Color().setHSL(210/360, 0.05, l);
    }
    // Warm grades
    return new THREE.Color().setHSL(grade.hue/360, grade.saturation, grade.lightness);
  }, [colorGrade]);

  // Diamond material with physically accurate properties
  const material = useMemo(() => {
    const grade = COLOR_GRADES[colorGrade];
    return new THREE.MeshPhysicalMaterial({
      color: diamondColor,
      metalness: 0,
      roughness: 0.0,
      transmission: 0.95 - grade.warmth * 0.1,
      thickness: 1.5,
      ior: 2.417, // Diamond's refractive index
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 3,
      transparent: true,
      opacity: 1,
    });
  }, [diamondColor, colorGrade]);

  // Set initial rotation based on view mode
  useEffect(() => {
    if (groupRef.current) {
      switch (viewMode) {
        case 'faceUp':
          groupRef.current.rotation.set(0, 0, 0);
          break;
        case 'side':
          groupRef.current.rotation.set(Math.PI / 3, 0, 0);
          break;
        case 'pavilion':
          groupRef.current.rotation.set(Math.PI, 0, 0);
          break;
      }
    }
  }, [viewMode]);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const scale = microscopeMode ? 1.8 : 1.2;

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
      <group>
        {inclusions.map((inclusion, i) => (
          <InclusionMesh 
            key={i} 
            inclusion={inclusion} 
            microscopeMode={microscopeMode}
          />
        ))}
      </group>
    </group>
  );
};

// Lighting setup for gemological accuracy
const GemologicalLighting = ({ microscopeMode }: { microscopeMode: boolean }) => {
  const intensity = microscopeMode ? 2 : 1;
  
  return (
    <>
      {/* Main diffused light from above */}
      <directionalLight
        position={[0, 10, 0]}
        intensity={intensity * 1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Ring light simulation for microscope */}
      {microscopeMode && (
        <>
          <pointLight position={[2, 3, 2]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-2, 3, 2]} intensity={0.8} color="#ffffff" />
          <pointLight position={[2, 3, -2]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-2, 3, -2]} intensity={0.8} color="#ffffff" />
        </>
      )}
      
      {/* Ambient fill */}
      <ambientLight intensity={microscopeMode ? 0.6 : 0.4} />
      
      {/* Fire-inducing spot lights */}
      <spotLight
        position={[3, 5, 3]}
        angle={0.3}
        penumbra={0.5}
        intensity={intensity}
        color="#fff8e7"
      />
      <spotLight
        position={[-3, 5, -3]}
        angle={0.3}
        penumbra={0.5}
        intensity={intensity * 0.8}
        color="#e7f3ff"
      />
    </>
  );
};

// Camera controller for view modes
const CameraController = ({ viewMode, microscopeMode }: { viewMode: string; microscopeMode: boolean }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const distance = microscopeMode ? 2.5 : 4;
    switch (viewMode) {
      case 'faceUp':
        camera.position.set(0, distance, 0.1);
        break;
      case 'side':
        camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7);
        break;
      case 'pavilion':
        camera.position.set(0, -distance, 0.1);
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
  const bgColor = microscopeMode ? '#0a0a0a' : '#1a1a2e';
  
  return (
    <div className={`w-full h-full min-h-[400px] rounded-xl overflow-hidden ${className}`}
         style={{ background: `linear-gradient(135deg, ${bgColor} 0%, #16213e 100%)` }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 4, 0.1], fov: microscopeMode ? 25 : 40 }}
        gl={{ antialias: true, alpha: true }}
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
        
        {/* Reflective floor for grading tray simulation */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        
        {/* Environment for realistic reflections */}
        <Environment preset="studio" />
        
        {showControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>
    </div>
  );
};

export default RealisticDiamond3D;
export { COLOR_GRADES, CLARITY_GRADES };
export type { InclusionType, Inclusion };
