import { useRef, useState, Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html, Sparkles, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

type DiamondShape = "round" | "princess" | "oval" | "cushion" | "emerald" | "pear" | "marquise" | "heart" | "radiant" | "asscher";

interface Diamond3DProps {
  shape: DiamondShape;
  autoRotate?: boolean;
  color?: string;
  showFire?: boolean;
  caratSize?: number;
}

// Create realistic brilliant cut geometry
const createBrilliantGeometry = (sides: number = 32): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  
  const tableRatio = 0.56;
  const crownHeight = 0.18;
  const girdleRadius = 1.0;
  const pavilionDepth = 0.45;
  
  const vertices: number[] = [];
  const indices: number[] = [];
  
  const addVertex = (x: number, y: number, z: number) => {
    vertices.push(x, y, z);
    return vertices.length / 3 - 1;
  };
  
  const tableY = crownHeight;
  const tableCenterIdx = addVertex(0, tableY, 0);
  
  // Table vertices
  const tableVertices: number[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const idx = addVertex(Math.cos(angle) * tableRatio, tableY, Math.sin(angle) * tableRatio);
    tableVertices.push(idx);
  }
  
  // Star vertices
  const starVertices: number[] = [];
  const starRadius = tableRatio + (girdleRadius - tableRatio) * 0.4;
  const starY = crownHeight * 0.5;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const idx = addVertex(Math.cos(angle) * starRadius, starY, Math.sin(angle) * starRadius);
    starVertices.push(idx);
  }
  
  // Upper girdle vertices
  const upperGirdleVertices: number[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides;
    const idx = addVertex(Math.cos(angle) * girdleRadius, 0.02, Math.sin(angle) * girdleRadius);
    upperGirdleVertices.push(idx);
  }
  
  // Lower girdle vertices
  const lowerGirdleVertices: number[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides;
    const idx = addVertex(Math.cos(angle) * girdleRadius, -0.02, Math.sin(angle) * girdleRadius);
    lowerGirdleVertices.push(idx);
  }
  
  // Pavilion main vertices
  const pavilionMainVertices: number[] = [];
  const pavilionMainRadius = girdleRadius * 0.4;
  const pavilionMainY = -pavilionDepth * 0.6;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const idx = addVertex(Math.cos(angle) * pavilionMainRadius, pavilionMainY, Math.sin(angle) * pavilionMainRadius);
    pavilionMainVertices.push(idx);
  }
  
  // Culet
  const culetIdx = addVertex(0, -pavilionDepth, 0);
  
  // Build faces - Table
  for (let i = 0; i < 8; i++) {
    indices.push(tableCenterIdx, tableVertices[i], tableVertices[(i + 1) % 8]);
  }
  
  // Crown star facets
  for (let i = 0; i < 8; i++) {
    indices.push(tableVertices[i], starVertices[i], tableVertices[(i + 1) % 8]);
  }
  
  // Crown bezel facets
  const girdleStep = sides / 8;
  for (let i = 0; i < 8; i++) {
    const nextI = (i + 1) % 8;
    const girdleStart = Math.round(i * girdleStep);
    const girdleEnd = Math.round((i + 1) * girdleStep);
    
    for (let j = girdleStart; j < girdleEnd; j++) {
      const nextJ = (j + 1) % sides;
      indices.push(starVertices[i], upperGirdleVertices[j], upperGirdleVertices[nextJ]);
      if (j === girdleStart) {
        indices.push(starVertices[i], starVertices[nextI === 0 ? 7 : nextI - 1] || starVertices[i], upperGirdleVertices[j]);
      }
    }
    indices.push(starVertices[i], starVertices[nextI], upperGirdleVertices[girdleEnd % sides]);
  }
  
  // Girdle band
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    indices.push(upperGirdleVertices[i], lowerGirdleVertices[i], upperGirdleVertices[next]);
    indices.push(upperGirdleVertices[next], lowerGirdleVertices[i], lowerGirdleVertices[next]);
  }
  
  // Pavilion facets
  for (let i = 0; i < 8; i++) {
    const nextI = (i + 1) % 8;
    const girdleStart = Math.round(i * girdleStep);
    const girdleEnd = Math.round((i + 1) * girdleStep);
    
    for (let j = girdleStart; j < girdleEnd; j++) {
      const nextJ = (j + 1) % sides;
      indices.push(lowerGirdleVertices[j], pavilionMainVertices[i], lowerGirdleVertices[nextJ]);
    }
    indices.push(pavilionMainVertices[i], pavilionMainVertices[nextI], lowerGirdleVertices[girdleEnd % sides]);
  }
  
  // Lower pavilion to culet
  for (let i = 0; i < 8; i++) {
    const nextI = (i + 1) % 8;
    indices.push(pavilionMainVertices[i], culetIdx, pavilionMainVertices[nextI]);
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
      <Sparkles count={60} scale={3} size={4 * intensity} speed={0.5} opacity={0.7} color="#ffffff" />
      <Sparkles count={20} scale={2.5} size={3} speed={0.3} opacity={0.5} color="#ff6b6b" />
      <Sparkles count={20} scale={2.5} size={3} speed={0.35} opacity={0.5} color="#4ecdc4" />
      <Sparkles count={20} scale={2.5} size={3} speed={0.4} opacity={0.5} color="#a855f7" />
    </group>
  );
};

// Rainbow fire beams
const FireBeams = ({ visible = true }: { visible?: boolean }) => {
  const beamsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (beamsRef.current && visible) {
      beamsRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      beamsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const t = state.clock.elapsedTime + i * 0.4;
        mesh.scale.y = 0.6 + Math.sin(t * 3) * 0.4;
        mat.opacity = 0.2 + Math.sin(t * 2) * 0.15;
      });
    }
  });

  const colors = ["#ff4444", "#ff8844", "#ffff44", "#44ff44", "#44ffff", "#4444ff", "#ff44ff", "#ff4488"];

  if (!visible) return null;

  return (
    <group ref={beamsRef} position={[0, 0.2, 0]}>
      {colors.map((color, i) => (
        <mesh key={i} rotation={[0, (i / colors.length) * Math.PI * 2, Math.PI / 5]}>
          <coneGeometry args={[0.015, 2.5, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

// Diamond mesh with shape variants
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
  
  const scale = useMemo(() => 0.8 + caratSize * 0.15, [caratSize]);
  
  // Shape-specific parameters
  const shapeParams = useMemo(() => {
    switch (shape) {
      case "round":
        return { sides: 32, scaleX: 1, scaleZ: 1, crownHeight: 1 };
      case "princess":
        return { sides: 4, scaleX: 1, scaleZ: 1, crownHeight: 0.95 };
      case "oval":
        return { sides: 32, scaleX: 1.35, scaleZ: 0.85, crownHeight: 0.9 };
      case "cushion":
        return { sides: 4, scaleX: 1.1, scaleZ: 1.1, crownHeight: 0.92 };
      case "emerald":
        return { sides: 4, scaleX: 1.45, scaleZ: 0.9, crownHeight: 0.85 };
      case "pear":
        return { sides: 32, scaleX: 1.25, scaleZ: 0.8, crownHeight: 1.05 };
      case "marquise":
        return { sides: 32, scaleX: 1.6, scaleZ: 0.55, crownHeight: 1.1 };
      case "heart":
        return { sides: 32, scaleX: 1.1, scaleZ: 1, crownHeight: 0.95 };
      case "radiant":
        return { sides: 8, scaleX: 1.2, scaleZ: 1, crownHeight: 0.9 };
      case "asscher":
        return { sides: 8, scaleX: 1, scaleZ: 1, crownHeight: 0.88 };
      default:
        return { sides: 32, scaleX: 1, scaleZ: 1, crownHeight: 1 };
    }
  }, [shape]);
  
  const geometry = useMemo(() => createBrilliantGeometry(shapeParams.sides), [shapeParams.sides]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle breathing animation
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
      groupRef.current.scale.setScalar(scale * breathe);
    }
  });

  const diamondColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group ref={groupRef} scale={scale}>
      <mesh
        geometry={geometry}
        scale={[shapeParams.scaleX, shapeParams.crownHeight, shapeParams.scaleZ]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0}
          roughness={0}
          transmission={0.96}
          thickness={2}
          ior={2.417}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={hovered ? 5 : 4}
          transparent
          opacity={1}
          attenuationDistance={0.5}
          attenuationColor={diamondColor}
          sheen={0.5}
          sheenRoughness={0.2}
          sheenColor={new THREE.Color("#ffffff")}
          specularIntensity={1.2}
          specularColor={new THREE.Color("#ffffff")}
        />
      </mesh>

      {showFire && (
        <>
          <FireBeams visible={true} />
          <PrismaticSparkles intensity={hovered ? 1.5 : 1} />
        </>
      )}
    </group>
  );
};

// Advanced lighting rig
const DiamondLighting = ({ showFire }: { showFire: boolean }) => {
  const lightsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lightsRef.current && showFire) {
      lightsRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <>
      {/* Key light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#ffffff"
      />
      
      {/* Fill light */}
      <directionalLight position={[-4, 6, -4]} intensity={1} color="#f0f8ff" />
      
      {/* Rim lights */}
      <pointLight position={[3, 2, 3]} intensity={0.8} color="#fff5e6" distance={10} />
      <pointLight position={[-3, 2, -3]} intensity={0.8} color="#e6f0ff" distance={10} />
      
      {/* Top brilliance light */}
      <spotLight
        position={[0, 6, 0]}
        angle={0.4}
        penumbra={0.5}
        intensity={2}
        color="#ffffff"
        castShadow
      />
      
      {/* Rotating colored lights for fire effect */}
      {showFire && (
        <group ref={lightsRef}>
          <pointLight position={[3, 1, 0]} intensity={0.5} color="#ff4444" distance={6} />
          <pointLight position={[-1.5, 1, 2.6]} intensity={0.5} color="#44ff44" distance={6} />
          <pointLight position={[-1.5, 1, -2.6]} intensity={0.5} color="#4444ff" distance={6} />
          <pointLight position={[0, 1, 3]} intensity={0.4} color="#ffff44" distance={6} />
          <pointLight position={[0, 1, -3]} intensity={0.4} color="#ff44ff" distance={6} />
        </group>
      )}
      
      {/* Ambient */}
      <ambientLight intensity={0.35} />
    </>
  );
};

// Camera controller
const CameraController = ({ shape }: { shape: DiamondShape }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Adjust camera based on shape for best viewing angle
    const elongatedShapes = ["marquise", "pear", "oval", "emerald"];
    const distance = elongatedShapes.includes(shape) ? 4.5 : 4;
    camera.position.set(0, 1.5, distance);
    camera.lookAt(0, 0, 0);
  }, [shape, camera]);
  
  return null;
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="flex flex-col items-center gap-3 text-white/80">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin" />
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
        background: "radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 40%, #020617 100%)"
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 4], fov: 40 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
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
          
          {/* Reflective surface */}
          <ContactShadows
            position={[0, -1.3, 0]}
            opacity={0.6}
            scale={8}
            blur={2.5}
            far={4}
          />
          
          {/* HDR Environment */}
          <Environment preset="city" />
          
          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 1.4}
            dampingFactor={0.05}
            enableDamping
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Diamond3DViewer;
