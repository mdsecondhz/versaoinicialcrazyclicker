import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function CrystalMesh({ onClick }: { onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const wireframeMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [clickScale, setClickScale] = useState(1);
  const [wireframeOpacity, setWireframeOpacity] = useState(0);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 1.5) * 0.1;
      
      // Interpolate scale back to 1
      if (clickScale > 1) {
        setClickScale(prev => Math.max(1, prev - delta * 5));
      }
      
      const hoverScale = hovered ? 1.05 : 1;
      meshRef.current.scale.setScalar(clickScale * hoverScale);
    }
    
    if (materialRef.current) {
      const targetEmissive = hovered ? 1.2 : 0.5;
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        materialRef.current.emissiveIntensity,
        targetEmissive,
        delta * 5
      );
    }

    if (wireframeMaterialRef.current) {
      if (wireframeOpacity > 0) {
        setWireframeOpacity(prev => Math.max(0, prev - delta * 2));
      }
      wireframeMaterialRef.current.opacity = wireframeOpacity;
      wireframeMaterialRef.current.transparent = true;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setClickScale(1.2);
    setWireframeOpacity(1);
    onClick();
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
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
        <mesh>
          <icosahedronGeometry args={[1.51, 0]} />
          <meshBasicMaterial 
            ref={wireframeMaterialRef}
            color="#ffffff" 
            wireframe 
            transparent 
            opacity={0} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </mesh>
    </group>
  );
}