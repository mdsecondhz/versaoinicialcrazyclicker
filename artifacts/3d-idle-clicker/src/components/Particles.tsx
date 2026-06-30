import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Particles({ count = 50 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const speed = 0.1 + Math.random() * 0.2;
      const scale = 0.02 + Math.random() * 0.05;
      
      temp.push({ x, y, z, speed, scale, angle: theta });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    particles.forEach((p, i) => {
      const newX = Math.cos(p.angle + time * p.speed) * Math.sqrt(p.x*p.x + p.z*p.z);
      const newZ = Math.sin(p.angle + time * p.speed) * Math.sqrt(p.x*p.x + p.z*p.z);
      const newY = p.y + Math.sin(time * 2 + i) * 0.2;
      
      dummy.position.set(newX, newY, newZ);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ffaa00"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
