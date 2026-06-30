import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function CrystalMesh({ onClick }: { onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [clickScale, setClickScale] = useState(1);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 1.5) * 0.1;
      
      // Interpolate scale back to 1
      if (clickScale > 1) {
        setClickScale(prev => Math.max(1, prev - delta * 3));
      }
      meshRef.current.scale.setScalar(clickScale);
    }
    
    if (materialRef.current) {
      const targetEmissive = hovered ? 0.8 : 0.5;
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        materialRef.current.emissiveIntensity,
        targetEmissive,
        delta * 5
      );
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setClickScale(1.15);
    onClick();
  };

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      cursor={hovered ? "pointer" : "auto"}
    >
      <icosahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#8844ff"
        emissive="#440088"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.1}
      />
    </mesh>
  );
}
