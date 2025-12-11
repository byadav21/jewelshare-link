import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";

type DiamondShape = "round" | "princess" | "oval" | "cushion" | "emerald" | "pear" | "marquise" | "heart" | "radiant" | "asscher";

interface Diamond3DProps {
  shape: DiamondShape;
  autoRotate?: boolean;
  color?: string;
  showFire?: boolean;
}

// Rainbow fire colors
const FIRE_COLORS = [
  new THREE.Color("#ff0000"),
  new THREE.Color("#ff7700"),
  new THREE.Color("#ffff00"),
  new THREE.Color("#00ff00"),
  new THREE.Color("#0077ff"),
  new THREE.Color("#7700ff"),
];

// Brilliance light beams
const LightBeams = ({ intensity = 1 }: { intensity?: number }) => {
  const beamsRef = useRef<THREE.Group>(null);
  const beamCount = 8;

  useFrame((state) => {
    if (beamsRef.current) {
      beamsRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      beamsRef.current.children.forEach((beam, i) => {
        const t = state.clock.getElapsedTime() + i * 0.5;
        (beam as THREE.Mesh).scale.y = 0.5 + Math.sin(t * 2) * 0.3;
        ((beam as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 3) * 0.2;
      });
    }
  });

  return (
    <group ref={beamsRef}>
      {Array.from({ length: beamCount }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.5, 0]}
          rotation={[0, (i / beamCount) * Math.PI * 2, Math.PI / 6]}
        >
          <coneGeometry args={[0.02, 2, 4]} />
          <meshBasicMaterial
            color={FIRE_COLORS[i % FIRE_COLORS.length]}
            transparent
            opacity={0.4 * intensity}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

// Fire dispersion effect
const FireEffect = () => {
  const fireRef = useRef<THREE.Points>(null);
  const count = 100;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.random() * 0.8 - 0.2;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const color = FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)];
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return cols;
  }, []);

  useFrame((state) => {
    if (fireRef.current) {
      fireRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      const positions = fireRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const t = state.clock.getElapsedTime() + i * 0.1;
        positions[i * 3 + 1] = Math.sin(t * 2) * 0.2 + (Math.random() - 0.5) * 0.05;
      }
      fireRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={fireRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Prismatic refraction shader material
const RefractionMaterial = ({ color }: { color: string }) => {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      materialRef.current.envMapIntensity = 3 + Math.sin(t * 2) * 0.5;
      materialRef.current.iridescence = 0.3 + Math.sin(t * 1.5) * 0.2;
    }
  });

  return (
    <meshPhysicalMaterial
      ref={materialRef}
      color={color}
      metalness={0.0}
      roughness={0.0}
      transmission={0.95}
      thickness={1.5}
      envMapIntensity={3.5}
      clearcoat={1}
      clearcoatRoughness={0.0}
      ior={2.417} // Diamond's refractive index
      reflectivity={1}
      iridescence={0.5}
      iridescenceIOR={2.0}
      sheen={0.5}
      sheenColor={new THREE.Color("#ffffff")}
    />
  );
};

// Diamond geometry based on shape
const DiamondMesh = ({ shape, color = "#ffffff", showFire = true }: { shape: DiamondShape; color?: string; showFire?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle sparkle effect
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.3;
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

  const getSides = () => {
    if (shape === "round" || shape === "oval" || shape === "pear" || shape === "marquise" || shape === "heart") return 32;
    if (shape === "radiant" || shape === "asscher") return 8;
    return 4;
  };

  return (
    <group ref={groupRef}>
      {/* Crown (top) */}
      <mesh
        position={[0, 0.3, 0]}
        rotation={[Math.PI, 0, 0]}
        scale={getScale()}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry()}
        <RefractionMaterial color={hovered ? "#f0f8ff" : color} />
      </mesh>
      
      {/* Pavilion (bottom) */}
      <mesh
        position={[0, -0.4, 0]}
        scale={getScale()}
      >
        <coneGeometry args={[1, 0.8, getSides(), 1]} />
        <RefractionMaterial color={color} />
      </mesh>

      {/* Table facet (flat top) */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={getScale()}>
        <circleGeometry args={[0.6, getSides()]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.0}
          transmission={0.98}
          thickness={0.2}
          envMapIntensity={4}
          clearcoat={1}
          ior={2.417}
          iridescence={0.3}
        />
      </mesh>

      {/* Fire/brilliance effects */}
      {showFire && (
        <>
          <LightBeams intensity={hovered ? 1.5 : 1} />
          <FireEffect />
        </>
      )}
    </group>
  );
};

// Ambient sparkle particles
const AmbientSparkles = () => {
  return (
    <Sparkles
      count={80}
      scale={4}
      size={3}
      speed={0.4}
      opacity={0.6}
      color="#ffffff"
    />
  );
};

// Rotating colored lights for fire effect
const ColoredLights = () => {
  const lightsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightsRef.current) {
      lightsRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group ref={lightsRef}>
      <pointLight position={[2, 1, 0]} intensity={0.8} color="#ff4444" distance={5} />
      <pointLight position={[-2, 1, 0]} intensity={0.8} color="#4444ff" distance={5} />
      <pointLight position={[0, 1, 2]} intensity={0.8} color="#44ff44" distance={5} />
      <pointLight position={[0, 1, -2]} intensity={0.8} color="#ffff44" distance={5} />
    </group>
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

export const Diamond3DViewer = ({ shape, autoRotate = true, color = "#ffffff", showFire = true }: Diamond3DProps) => {
  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Base lighting */}
          <ambientLight intensity={0.4} />
          
          {/* Key light */}
          <spotLight
            position={[5, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={2}
            castShadow
            color="#ffffff"
          />
          
          {/* Fill light */}
          <spotLight
            position={[-5, 5, -5]}
            angle={0.3}
            penumbra={1}
            intensity={1.5}
            color="#ffeedd"
          />
          
          {/* Rim lights for brilliance */}
          <pointLight position={[0, 3, 0]} intensity={1.5} color="#ffffff" />
          <pointLight position={[2, -2, 2]} intensity={0.8} color="#87ceeb" />
          <pointLight position={[-2, -2, -2]} intensity={0.8} color="#ffd700" />

          {/* Colored rotating lights for fire */}
          <ColoredLights />

          {/* Diamond */}
          <DiamondMesh shape={shape} color={color} showFire={showFire} />

          {/* Ambient sparkles */}
          <AmbientSparkles />

          {/* Environment for realistic reflections */}
          <Environment preset="studio" />

          {/* Shadow */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.5}
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
