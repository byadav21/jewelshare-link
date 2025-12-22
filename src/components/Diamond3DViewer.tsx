import { useRef, useState, Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";

type DiamondShape = "round" | "princess" | "oval" | "cushion" | "emerald" | "pear" | "marquise" | "heart" | "radiant" | "asscher";

interface Diamond3DProps {
  shape: DiamondShape;
  autoRotate?: boolean;
  color?: string;
  showFire?: boolean;
  caratSize?: number;
}

// Create shape-specific outline for girdle
const createShapeOutline = (shape: DiamondShape, segments: number = 64): THREE.Vector2[] => {
  const points: THREE.Vector2[] = [];
  
  switch (shape) {
    case "round":
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector2(Math.cos(angle), Math.sin(angle)));
      }
      break;
      
    case "oval":
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector2(Math.cos(angle) * 1.4, Math.sin(angle) * 0.9));
      }
      break;
      
    case "pear":
      for (let i = 0; i < segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        // Pear/teardrop shape parametric equation
        const r = 0.8 + 0.4 * Math.sin(t / 2);
        const x = r * Math.sin(t) * 0.85;
        const y = r * Math.cos(t) * 1.1 - 0.2;
        points.push(new THREE.Vector2(x, y));
      }
      break;
      
    case "marquise":
      for (let i = 0; i < segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        // Pointed oval (marquise) shape
        const x = Math.sin(t) * 0.55;
        const y = Math.cos(t) * 1.5;
        // Taper the ends
        const taper = Math.pow(Math.abs(Math.sin(t)), 0.3);
        points.push(new THREE.Vector2(x * taper, y));
      }
      break;
      
    case "heart":
      for (let i = 0; i < segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        // Heart shape parametric equation
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        points.push(new THREE.Vector2(x / 18, y / 18 - 0.1));
      }
      break;
      
    case "princess":
    case "asscher":
      // Square with slightly rounded corners
      const cornerRadius = shape === "asscher" ? 0.15 : 0.08;
      const size = 1.0;
      const corners = [
        { x: -size, y: -size },
        { x: size, y: -size },
        { x: size, y: size },
        { x: -size, y: size },
      ];
      const segsPerSide = Math.floor(segments / 4);
      for (let c = 0; c < 4; c++) {
        const start = corners[c];
        const end = corners[(c + 1) % 4];
        for (let i = 0; i < segsPerSide; i++) {
          const t = i / segsPerSide;
          let x = start.x + (end.x - start.x) * t;
          let y = start.y + (end.y - start.y) * t;
          // Round the corners
          const distFromCorner = Math.min(
            Math.hypot(x - start.x, y - start.y),
            Math.hypot(x - end.x, y - end.y)
          );
          if (distFromCorner < cornerRadius * 2) {
            const blend = distFromCorner / (cornerRadius * 2);
            const angle = Math.atan2(y, x);
            const targetR = Math.max(Math.abs(x), Math.abs(y));
            const smoothR = targetR * (0.95 + 0.05 * blend);
            x = Math.cos(angle) * smoothR * Math.sign(x) * (Math.abs(x) > 0.01 ? 1 : 0) || x;
            y = Math.sin(angle) * smoothR * Math.sign(y) * (Math.abs(y) > 0.01 ? 1 : 0) || y;
          }
          points.push(new THREE.Vector2(x * 0.75, y * 0.75));
        }
      }
      break;
      
    case "cushion":
      // Rounded square (cushion)
      for (let i = 0; i < segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        // Superellipse formula for cushion shape
        const n = 3; // Higher = more rounded
        const a = 1.0, b = 1.0;
        const cosT = Math.cos(t);
        const sinT = Math.sin(t);
        const x = Math.sign(cosT) * a * Math.pow(Math.abs(cosT), 2/n);
        const y = Math.sign(sinT) * b * Math.pow(Math.abs(sinT), 2/n);
        points.push(new THREE.Vector2(x, y));
      }
      break;
      
    case "emerald":
    case "radiant":
      // Elongated octagon (emerald cut)
      const ratio = shape === "emerald" ? 1.5 : 1.2;
      const cutCorner = 0.25;
      const octPoints = [
        new THREE.Vector2(-1 + cutCorner, -ratio),
        new THREE.Vector2(1 - cutCorner, -ratio),
        new THREE.Vector2(1, -ratio + cutCorner * ratio),
        new THREE.Vector2(1, ratio - cutCorner * ratio),
        new THREE.Vector2(1 - cutCorner, ratio),
        new THREE.Vector2(-1 + cutCorner, ratio),
        new THREE.Vector2(-1, ratio - cutCorner * ratio),
        new THREE.Vector2(-1, -ratio + cutCorner * ratio),
      ];
      const segsPerEdge = Math.floor(segments / 8);
      for (let e = 0; e < 8; e++) {
        const p1 = octPoints[e];
        const p2 = octPoints[(e + 1) % 8];
        for (let i = 0; i < segsPerEdge; i++) {
          const t = i / segsPerEdge;
          points.push(new THREE.Vector2(
            (p1.x + (p2.x - p1.x) * t) * 0.65,
            (p1.y + (p2.y - p1.y) * t) * 0.65
          ));
        }
      }
      break;
      
    default:
      // Fallback to round
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector2(Math.cos(angle), Math.sin(angle)));
      }
  }
  
  return points;
};

// Create diamond geometry from shape outline
const createDiamondGeometry = (shape: DiamondShape): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  const segments = 64;
  const outline = createShapeOutline(shape, segments);
  
  const crownHeight = 0.22;
  const pavilionDepth = 0.5;
  const tableRatio = 0.55;
  const girdleThickness = 0.04;
  
  const vertices: number[] = [];
  const indices: number[] = [];
  
  const addVertex = (x: number, y: number, z: number): number => {
    vertices.push(x, y, z);
    return vertices.length / 3 - 1;
  };
  
  // Table center
  const tableCenterIdx = addVertex(0, crownHeight, 0);
  
  // Table outline vertices
  const tableVertices: number[] = [];
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i];
    const idx = addVertex(p.x * tableRatio, crownHeight, p.y * tableRatio);
    tableVertices.push(idx);
  }
  
  // Upper girdle vertices (crown meets girdle)
  const upperGirdleVertices: number[] = [];
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i];
    const idx = addVertex(p.x, girdleThickness / 2, p.y);
    upperGirdleVertices.push(idx);
  }
  
  // Lower girdle vertices
  const lowerGirdleVertices: number[] = [];
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i];
    const idx = addVertex(p.x, -girdleThickness / 2, p.y);
    lowerGirdleVertices.push(idx);
  }
  
  // Culet (bottom point)
  const culetIdx = addVertex(0, -pavilionDepth, 0);
  
  // Build table facets
  for (let i = 0; i < outline.length; i++) {
    const next = (i + 1) % outline.length;
    indices.push(tableCenterIdx, tableVertices[i], tableVertices[next]);
  }
  
  // Build crown facets (table to girdle)
  for (let i = 0; i < outline.length; i++) {
    const next = (i + 1) % outline.length;
    // Triangle from table edge to girdle
    indices.push(tableVertices[i], upperGirdleVertices[i], tableVertices[next]);
    indices.push(tableVertices[next], upperGirdleVertices[i], upperGirdleVertices[next]);
  }
  
  // Build girdle facets
  for (let i = 0; i < outline.length; i++) {
    const next = (i + 1) % outline.length;
    indices.push(upperGirdleVertices[i], lowerGirdleVertices[i], upperGirdleVertices[next]);
    indices.push(upperGirdleVertices[next], lowerGirdleVertices[i], lowerGirdleVertices[next]);
  }
  
  // Build pavilion facets (girdle to culet)
  for (let i = 0; i < outline.length; i++) {
    const next = (i + 1) % outline.length;
    indices.push(lowerGirdleVertices[i], culetIdx, lowerGirdleVertices[next]);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

// Prismatic fire sparkles
const PrismaticSparkles = ({ intensity = 1 }: { intensity?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={50} scale={2.5} size={3 * intensity} speed={0.4} opacity={0.6} color="#ffffff" />
      <Sparkles count={15} scale={2} size={2.5} speed={0.3} opacity={0.4} color="#ff6b6b" />
      <Sparkles count={15} scale={2} size={2.5} speed={0.35} opacity={0.4} color="#4ecdc4" />
      <Sparkles count={15} scale={2} size={2.5} speed={0.4} opacity={0.4} color="#a855f7" />
    </group>
  );
};

// Rainbow fire beams
const FireBeams = ({ visible = true }: { visible?: boolean }) => {
  const beamsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (beamsRef.current && visible) {
      beamsRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      beamsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const t = state.clock.elapsedTime + i * 0.4;
        mesh.scale.y = 0.5 + Math.sin(t * 3) * 0.3;
        mat.opacity = 0.15 + Math.sin(t * 2) * 0.1;
      });
    }
  });

  const colors = ["#ff4444", "#ff8844", "#ffff44", "#44ff44", "#44ffff", "#4444ff", "#ff44ff", "#ff4488"];

  if (!visible) return null;

  return (
    <group ref={beamsRef} position={[0, 0.1, 0]}>
      {colors.map((color, i) => (
        <mesh key={i} rotation={[0, (i / colors.length) * Math.PI * 2, Math.PI / 6]}>
          <coneGeometry args={[0.012, 2, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

// Shape label component
const ShapeLabel = ({ shape }: { shape: DiamondShape }) => {
  const labelMap: Record<DiamondShape, string> = {
    round: "Round Brilliant",
    princess: "Princess Cut",
    oval: "Oval",
    cushion: "Cushion",
    emerald: "Emerald Cut",
    pear: "Pear",
    marquise: "Marquise",
    heart: "Heart",
    radiant: "Radiant",
    asscher: "Asscher"
  };
  
  return (
    <Html position={[0, -1.2, 0]} center>
      <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium">
        {labelMap[shape]}
      </div>
    </Html>
  );
};

// Diamond mesh with accurate shape geometries
const DiamondMesh = ({ 
  shape, 
  color = "#f8fcff", 
  showFire = true,
  caratSize = 1 
}: { 
  shape: DiamondShape; 
  color?: string; 
  showFire?: boolean;
  caratSize?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const scale = useMemo(() => 0.7 + caratSize * 0.12, [caratSize]);
  
  // Create the actual shape-specific geometry
  const geometry = useMemo(() => createDiamondGeometry(shape), [shape]);

  useFrame((state) => {
    if (groupRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.008;
      groupRef.current.scale.setScalar(scale * breathe);
    }
  });

  const diamondColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group ref={groupRef} scale={scale}>
      <mesh
        geometry={geometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0}
          roughness={0}
          transmission={0.95}
          thickness={1.8}
          ior={2.417}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={hovered ? 4.5 : 3.5}
          transparent
          opacity={1}
          attenuationDistance={0.6}
          attenuationColor={diamondColor}
          sheen={0.4}
          sheenRoughness={0.2}
          sheenColor={new THREE.Color("#ffffff")}
          specularIntensity={1}
          specularColor={new THREE.Color("#ffffff")}
        />
      </mesh>

      {showFire && (
        <>
          <FireBeams visible={true} />
          <PrismaticSparkles intensity={hovered ? 1.3 : 1} />
        </>
      )}
      
      <ShapeLabel shape={shape} />
    </group>
  );
};

// Advanced lighting rig
const DiamondLighting = ({ showFire }: { showFire: boolean }) => {
  const lightsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lightsRef.current && showFire) {
      lightsRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <>
      {/* Key light */}
      <directionalLight
        position={[4, 7, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#ffffff"
      />
      
      {/* Fill light */}
      <directionalLight position={[-3, 5, -3]} intensity={0.8} color="#f0f8ff" />
      
      {/* Rim lights */}
      <pointLight position={[2.5, 1.5, 2.5]} intensity={0.6} color="#fff5e6" distance={8} />
      <pointLight position={[-2.5, 1.5, -2.5]} intensity={0.6} color="#e6f0ff" distance={8} />
      
      {/* Top brilliance */}
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={0.6}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />
      
      {/* Rotating accent lights */}
      {showFire && (
        <group ref={lightsRef}>
          <pointLight position={[2.5, 0.8, 0]} intensity={0.4} color="#ff6666" distance={5} />
          <pointLight position={[-1.25, 0.8, 2.2]} intensity={0.4} color="#66ff66" distance={5} />
          <pointLight position={[-1.25, 0.8, -2.2]} intensity={0.4} color="#6666ff" distance={5} />
        </group>
      )}
      
      <ambientLight intensity={0.3} />
    </>
  );
};

// Camera controller
const CameraController = ({ shape }: { shape: DiamondShape }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const elongatedShapes = ["marquise", "pear", "oval", "emerald"];
    const distance = elongatedShapes.includes(shape) ? 4.2 : 3.8;
    camera.position.set(0, 1.2, distance);
    camera.lookAt(0, 0, 0);
  }, [shape, camera]);
  
  return null;
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="flex flex-col items-center gap-3 text-white/80">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-3 border-white/20 rounded-full" />
        <div className="absolute inset-0 border-3 border-transparent border-t-white rounded-full animate-spin" />
      </div>
      <span className="text-sm font-medium">Loading Diamond...</span>
    </div>
  </Html>
);

export const Diamond3DViewer = ({ 
  shape, 
  autoRotate = true, 
  color = "#f8fcff", 
  showFire = true,
  caratSize = 1
}: Diamond3DProps) => {
  return (
    <div 
      className="w-full h-full min-h-[300px] rounded-xl overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 50%, #020617 100%)"
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.2, 3.8], fov: 42 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <CameraController shape={shape} />
          <DiamondLighting showFire={showFire} />
          
          <DiamondMesh 
            shape={shape} 
            color={color} 
            showFire={showFire} 
            caratSize={caratSize}
          />
          
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.5}
            scale={6}
            blur={2}
            far={3}
          />
          
          <Environment preset="city" />
          
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.5}
            dampingFactor={0.05}
            enableDamping
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Diamond3DViewer;
