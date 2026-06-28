"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Trail } from "@react-three/drei";
import * as THREE from "three";

function AirplaneMesh({ wireframe = false }: { wireframe?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
    }
  });

  const yellowMat = new THREE.MeshStandardMaterial({ color: "#FFE600", metalness: 0.4, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: "#111111", metalness: 0.6, roughness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: "#334455", metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.7 });
  const redMat = new THREE.MeshStandardMaterial({ color: "#FF3333", metalness: 0.3, roughness: 0.4 });

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      {/* Fuselage */}
      <mesh material={darkMat} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 3.2, 20]} />
        <primitive object={darkMat} />
      </mesh>

      {/* Yellow stripe on fuselage */}
      <mesh position={[0, 0, 0]} material={yellowMat}>
        <cylinderGeometry args={[0.285, 0.285, 0.22, 20]} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 1.8, 0]} material={darkMat}>
        <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>

      {/* Tail cone */}
      <mesh position={[0, -1.65, 0]} material={darkMat}>
        <coneGeometry args={[0.22, 0.5, 16]} />
      </mesh>

      {/* Main wings */}
      <mesh position={[0.95, 0, 0.05]} rotation={[0, 0, -Math.PI * 0.07]} material={yellowMat} castShadow>
        <boxGeometry args={[1.4, 0.06, 0.55]} />
      </mesh>
      <mesh position={[-0.95, 0, 0.05]} rotation={[0, 0, Math.PI * 0.07]} material={yellowMat} castShadow>
        <boxGeometry args={[1.4, 0.06, 0.55]} />
      </mesh>

      {/* Wing tips — slightly swept */}
      <mesh position={[1.62, 0.08, 0]} rotation={[0, 0, -Math.PI * 0.12]} material={darkMat}>
        <boxGeometry args={[0.3, 0.04, 0.3]} />
      </mesh>
      <mesh position={[-1.62, 0.08, 0]} rotation={[0, 0, Math.PI * 0.12]} material={darkMat}>
        <boxGeometry args={[0.3, 0.04, 0.3]} />
      </mesh>

      {/* Horizontal stabilizers */}
      <mesh position={[0.52, -1.35, 0]} rotation={[0, 0, -Math.PI * 0.05]} material={yellowMat}>
        <boxGeometry args={[0.75, 0.04, 0.3]} />
      </mesh>
      <mesh position={[-0.52, -1.35, 0]} rotation={[0, 0, Math.PI * 0.05]} material={yellowMat}>
        <boxGeometry args={[0.75, 0.04, 0.3]} />
      </mesh>

      {/* Vertical stabilizer */}
      <mesh position={[0, -1.1, -0.18]} rotation={[Math.PI * 0.05, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.05, 0.7, 0.42]} />
      </mesh>

      {/* Engines */}
      <mesh position={[0.72, -0.12, 0.15]} material={darkMat}>
        <cylinderGeometry args={[0.12, 0.1, 0.55, 16]} />
      </mesh>
      <mesh position={[-0.72, -0.12, 0.15]} material={darkMat}>
        <cylinderGeometry args={[0.12, 0.1, 0.55, 16]} />
      </mesh>

      {/* Engine nacelles (yellow ring) */}
      <mesh position={[0.72, 0.15, 0.15]} material={yellowMat}>
        <torusGeometry args={[0.12, 0.018, 12, 24]} />
      </mesh>
      <mesh position={[-0.72, 0.15, 0.15]} material={yellowMat}>
        <torusGeometry args={[0.12, 0.018, 12, 24]} />
      </mesh>

      {/* Windows strip */}
      {[-0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.1].map((y, i) => (
        <mesh key={i} position={[0.285, y, 0]} material={glassMat}>
          <boxGeometry args={[0.01, 0.07, 0.1]} />
        </mesh>
      ))}

      {/* "SPIRIT" text representation — yellow band */}
      <mesh position={[0, 0.35, 0]} material={yellowMat}>
        <cylinderGeometry args={[0.282, 0.282, 0.08, 20]} />
      </mesh>

      {/* Landing gear stub */}
      <mesh position={[0, -0.38, 0.2]} material={darkMat}>
        <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
      </mesh>
      <mesh position={[0.28, -0.48, 0.2]} material={darkMat}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      <mesh position={[-0.28, -0.48, 0.2]} material={darkMat}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>

      {/* Glow halo underneath — distress indicator */}
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color="#FF3333" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function GridFloor() {
  const lines = useMemo(() => {
    const pts: THREE.Vector3[][] = [];
    for (let i = -5; i <= 5; i++) {
      pts.push([new THREE.Vector3(i, -2.2, -5), new THREE.Vector3(i, -2.2, 5)]);
      pts.push([new THREE.Vector3(-5, -2.2, i), new THREE.Vector3(5, -2.2, i)]);
    }
    return pts;
  }, []);

  return (
    <>
      {lines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FFE60015" />
        </line>
      ))}
    </>
  );
}

function ParticleField() {
  const count = 60;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFE600" size={0.025} transparent opacity={0.4} />
    </points>
  );
}

export default function AirplaneScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 6], fov: 42 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#070707"]} />
      <fog attach="fog" args={["#070707", 10, 22]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} color="#FFE600" castShadow />
      <directionalLight position={[-4, 2, -4]} intensity={0.4} color="#334466" />
      <pointLight position={[0, -1, 2]} intensity={0.8} color="#FF3333" />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#FFE600" />

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
        <AirplaneMesh />
      </Float>

      <ParticleField />
      <GridFloor />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        autoRotate={false}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.75}
      />
    </Canvas>
  );
}
