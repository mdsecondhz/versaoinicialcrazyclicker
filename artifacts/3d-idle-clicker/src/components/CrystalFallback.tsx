import { useState, useEffect, useRef } from "react";

interface CrystalFallbackProps {
  onClick: () => void;
}

export function CrystalFallback({ onClick }: CrystalFallbackProps) {
  const [clicked, setClicked] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    onClick();
    setClicked(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setClicked(false), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 60%, #1a0a2e 0%, #0a0a1a 70%)" }}>

      {/* Ambient glow rings */}
      <div className="absolute" style={{ width: 420, height: 420 }}>
        <div className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "radial-gradient(circle, rgba(136,68,255,0.08) 0%, transparent 70%)", animationDuration: "3s" }} />
        <div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(136,68,255,0.05) 0%, transparent 65%)", animation: "pulse 4s ease-in-out infinite" }} />
      </div>

      {/* Orbiting particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const radius = 120 + (i % 3) * 30;
        const size = 3 + (i % 4);
        const duration = 8 + (i % 5) * 1.5;
        const delay = -(i / 12) * duration;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: i % 2 === 0 ? "#ffd700" : "#aa66ff",
              boxShadow: i % 2 === 0 ? "0 0 6px #ffd700" : "0 0 6px #aa66ff",
              animation: `orbit${i % 2 === 0 ? "CW" : "CCW"} ${duration}s linear ${delay}s infinite`,
              transformOrigin: `${radius}px 0`,
              left: "50%",
              top: "50%",
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
          />
        );
      })}

      {/* Crystal gem */}
      <button
        data-testid="crystal-click-target"
        onClick={handleClick}
        className="relative z-10 cursor-pointer border-0 bg-transparent p-0 focus:outline-none"
        style={{
          animation: "floatCrystal 3s ease-in-out infinite",
          transform: clicked ? "scale(1.12)" : "scale(1)",
          transition: "transform 0.12s ease-out",
        }}
      >
        {/* Outer glow halo */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: "-30px",
            background: "radial-gradient(circle, rgba(136,68,255,0.35) 0%, transparent 70%)",
            animation: "glowPulse 2s ease-in-out infinite",
          }}
        />

        {/* SVG Crystal polygon */}
        <svg
          width="200"
          height="220"
          viewBox="0 0 200 220"
          style={{
            filter: "drop-shadow(0 0 20px rgba(136,68,255,0.9)) drop-shadow(0 0 40px rgba(100,40,220,0.6))",
            animation: "spinSlow 12s linear infinite",
          }}
        >
          <defs>
            <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cc88ff" stopOpacity="1" />
              <stop offset="30%" stopColor="#8844ff" stopOpacity="1" />
              <stop offset="70%" stopColor="#5522cc" stopOpacity="1" />
              <stop offset="100%" stopColor="#330077" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="faceGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dd99ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6633bb" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="faceGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9955ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#220055" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="faceGrad3" x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#bb77ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#441188" stopOpacity="0.9" />
            </linearGradient>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main crystal body - icosahedron-like shape */}
          {/* Top cap */}
          <polygon points="100,20 60,80 140,80" fill="url(#faceGrad1)" opacity="0.95" />
          {/* Upper left face */}
          <polygon points="100,20 30,110 60,80" fill="url(#faceGrad2)" opacity="0.9" />
          {/* Upper right face */}
          <polygon points="100,20 170,110 140,80" fill="url(#faceGrad1)" opacity="0.85" />
          {/* Middle left face */}
          <polygon points="30,110 60,80 50,150" fill="url(#faceGrad3)" opacity="0.88" />
          {/* Middle center face */}
          <polygon points="60,80 140,80 100,155" fill="url(#crystalGrad)" opacity="0.92" />
          {/* Middle right face */}
          <polygon points="140,80 170,110 150,150" fill="url(#faceGrad2)" opacity="0.86" />
          {/* Lower left face */}
          <polygon points="50,150 100,155 80,200" fill="url(#faceGrad3)" opacity="0.9" />
          {/* Lower center face */}
          <polygon points="100,155 150,150 100,200" fill="url(#crystalGrad)" opacity="0.88" />
          {/* Lower right face */}
          <polygon points="150,150 170,110 100,200" fill="url(#faceGrad2)" opacity="0.85" />
          {/* Bottom connections */}
          <polygon points="30,110 50,150 80,200" fill="url(#faceGrad1)" opacity="0.82" />
          <polygon points="80,200 100,200 100,155" fill="url(#faceGrad3)" opacity="0.9" />

          {/* Specular highlight */}
          <polygon points="100,20 60,80 80,50" fill="white" opacity="0.25" />
          <polygon points="100,20 80,50 100,45" fill="white" opacity="0.4" />

          {/* Inner glow core */}
          <ellipse cx="100" cy="110" rx="25" ry="35"
            fill="rgba(200,150,255,0.15)" filter="url(#innerGlow)" />
        </svg>

        {/* Click ripple effect overlay */}
        {clicked && (
          <div
            className="absolute inset-0 rounded-full animate-ping pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(136,68,255,0.4) 0%, transparent 70%)", animationDuration: "0.4s" }}
          />
        )}
      </button>

      {/* Bottom atmospheric fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(10,5,30,0.8) 0%, transparent 100%)" }}
      />

      <style>{`
        @keyframes floatCrystal {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes spinSlow {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes orbitCW {
          from { transform: rotate(0deg) translateX(var(--orbit-r, 140px)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--orbit-r, 140px)) rotate(-360deg); }
        }
        @keyframes orbitCCW {
          from { transform: rotate(0deg) translateX(var(--orbit-r, 140px)) rotate(0deg); }
          to   { transform: rotate(-360deg) translateX(var(--orbit-r, 140px)) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
