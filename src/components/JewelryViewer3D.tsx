import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

const Diamond = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <octahedronGeometry args={[1.2, 0]} />
      <meshPhysicalMaterial
        color="#e8f4ff"
        metalness={0.1}
        roughness={0.05}
        transmission={0.95}
        thickness={1.5}
        envMapIntensity={2}
        clearcoat={1}
        clearcoatRoughness={0.1}
        ior={2.417}
      />
    </mesh>
  );
};

const Ring = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <mesh castShadow>
        <torusGeometry args={[1.5, 0.15, 32, 100]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Small accent diamonds */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5]}
            scale={0.15}
            castShadow
          >
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color="#ffffff"
              metalness={0}
              roughness={0}
              transmission={0.98}
              thickness={0.5}
              envMapIntensity={2}
              ior={2.417}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 6]} fov={50} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      <pointLight position={[0, -3, 0]} intensity={0.3} color="#a855f7" />

      <Diamond />
      <Ring />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
          mirror={0}
        />
      </mesh>

    </>
  );
};

export const JewelryViewer3D = () => {
  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};
