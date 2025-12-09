import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";

type DiamondShape = "round" | "princess" | "oval" | "cushion" | "emerald" | "pear" | "marquise" | "heart" | "radiant" | "asscher";

interface Diamond3DProps {
  shape: DiamondShape;
  autoRotate?: boolean;
  color?: string;
}

// Diamond geometry based on shape
const DiamondMesh = ({ shape, color = "#ffffff" }: { shape: DiamondShape; color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle sparkle effect
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  // Create geometry based on shape
  const getGeometry = () => {
    switch (shape) {
      case "round":
        return <coneGeometry args={[1, 1.5, 32, 1]} />;
      case "princess":
        return <coneGeometry args={[1, 1.5, 4, 1]} />;
      case "oval":
        return <coneGeometry args={[1, 1.2, 32, 1]} />;
      case "cushion":
        return <coneGeometry args={[1, 1.4, 4, 1]} />;
      case "emerald":
        return <coneGeometry args={[0.9, 1.3, 4, 1]} />;
      case "pear":
        return <coneGeometry args={[1, 1.6, 32, 1]} />;
      case "marquise":
        return <coneGeometry args={[0.7, 1.8, 32, 1]} />;
      case "heart":
        return <coneGeometry args={[1, 1.4, 32, 1]} />;
      case "radiant":
        return <coneGeometry args={[0.95, 1.4, 8, 1]} />;
      case "asscher":
        return <coneGeometry args={[0.9, 1.3, 8, 1]} />;
      default:
        return <coneGeometry args={[1, 1.5, 32, 1]} />;
    }
  };

  // Get scale based on shape
  const getScale = (): [number, number, number] => {
    switch (shape) {
      case "oval":
        return [1.3, 1, 0.9];
      case "marquise":
        return [1.5, 1, 0.6];
      case "pear":
        return [1.2, 1, 0.85];
      case "emerald":
        return [1.4, 1, 0.9];
      case "cushion":
        return [1.1, 1, 1.1];
      case "radiant":
        return [1.2, 1, 1];
      default:
        return [1, 1, 1];
    }
  };

  return (
    <group>
      {/* Crown (top) */}
      <mesh
        ref={meshRef}
        position={[0, 0.3, 0]}
        rotation={[Math.PI, 0, 0]}
        scale={getScale()}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry()}
        <meshPhysicalMaterial
          color={hovered ? "#f0f8ff" : color}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          envMapIntensity={3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={2.4}
          reflectivity={1}
        />
      </mesh>
      
      {/* Pavilion (bottom) */}
      <mesh
        position={[0, -0.4, 0]}
        scale={getScale()}
      >
        <coneGeometry args={[1, 0.8, shape === "round" || shape === "oval" || shape === "pear" || shape === "marquise" || shape === "heart" ? 32 : shape === "radiant" || shape === "asscher" ? 8 : 4, 1]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          envMapIntensity={3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={2.4}
          reflectivity={1}
        />
      </mesh>

      {/* Table facet (flat top) */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={getScale()}>
        <circleGeometry args={[0.6, shape === "round" || shape === "oval" ? 32 : 4]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.2}
          roughness={0.02}
          transmission={0.95}
          thickness={0.3}
          envMapIntensity={4}
          clearcoat={1}
          ior={2.4}
        />
      </mesh>
    </group>
  );
};

// Sparkle particles
const Sparkles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 50;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading 3D...</span>
    </div>
  </Html>
);

export const Diamond3DViewer = ({ shape, autoRotate = true, color = "#ffffff" }: Diamond3DProps) => {
  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <spotLight
            position={[5, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={2}
            castShadow
          />
          <spotLight
            position={[-5, 5, -5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color="#ffd700"
          />
          <pointLight position={[0, 3, 0]} intensity={1} color="#ffffff" />
          <pointLight position={[2, -2, 2]} intensity={0.5} color="#87ceeb" />

          {/* Diamond */}
          <DiamondMesh shape={shape} color={color} />

          {/* Sparkles */}
          <Sparkles />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Shadow */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Diamond3DViewer;
