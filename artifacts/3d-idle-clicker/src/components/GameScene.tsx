import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { CrystalMesh } from "./CrystalMesh";
import { Particles } from "./Particles";
import { CrystalFallback } from "./CrystalFallback";
import { isWebGLSupported } from "@/lib/webglDetect";

function ThreeScene({ onCrystalClick }: { onCrystalClick: () => void }) {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.3} color="#ffffff" />
      <pointLight position={[3, 3, 3]} color="#ffd700" intensity={2} />
      <pointLight position={[-3, -2, 2]} color="#8844ff" intensity={1.5} />
      <CrystalMesh onClick={onCrystalClick} />
      <Particles count={50} />
    </Canvas>
  );
}

export function GameScene({ onCrystalClick }: { onCrystalClick: () => void }) {
  const webglAvailable = useMemo(() => isWebGLSupported(), []);

  return (
    <div className="absolute inset-0 z-0" style={{ background: "#0a0a1a" }}>
      {webglAvailable ? (
        <ThreeScene onCrystalClick={onCrystalClick} />
      ) : (
        <CrystalFallback onClick={onCrystalClick} />
      )}
    </div>
  );
}
