import { useState, useEffect, useRef, useMemo } from "react";

interface CrystalFallbackProps {
  onClick: () => void;
}

export function CrystalFallback({ onClick }: CrystalFallbackProps) {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [runes, setRunes] = useState<{ id: number, char: string, x: number, y: number, delay: number }[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const RUNE_CHARS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛟ", "ᛞ"];

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

  // Generate random runes that appear and fade
  useEffect(() => {
    const interval = setInterval(() => {
      setRunes(prev => {
        const now = Date.now();
        // keep recent runes, add new ones
        const valid = prev.filter(r => now - r.id < 4000);
        if (valid.length < 5) {
          const char = RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
          const angle = Math.random() * Math.PI * 2;
          const dist = 150 + Math.random() * 80;
          return [...valid, {
            id: now,
            char,
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            delay: Math.random() * 0.5
          }];
        }
        return valid;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-calculate particles
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const angle = (i / 18) * 360;
      const radius = 100 + Math.random() * 80;
      const size = 2 + Math.random() * 5;
      const duration = 5 + Math.random() * 8;
      const delay = -(Math.random() * duration);
      const isCW = Math.random() > 0.5;
      const color = Math.random() > 0.6 ? "#ffd700" : (Math.random() > 0.5 ? "#aa66ff" : "#dd99ff");
      
      return { id: i, radius, size, duration, delay, isCW, color };
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 60%, #1a0a2e 0%, #0a0a1a 70%)" }}>

      {/* Ambient glow rings */}
      <div className="absolute" style={{ width: 420, height: 420 }}>
        <div className="absolute inset-0 rounded-full animate-ping opacity-50"
          style={{ background: "radial-gradient(circle, rgba(136,68,255,0.15) 0%, transparent 70%)", animationDuration: "3s" }} />
        <div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(136,68,255,0.1) 0%, transparent 65%)", animation: "pulse 4s ease-in-out infinite" }} />
      </div>

      {/* Floating runes */}
      <div className="absolute top-1/2 left-1/2 pointer-events-none">
        {runes.map(r => (
          <div key={r.id} className="absolute text-primary text-xl font-bold opacity-0 drop-shadow-[0_0_5px_rgba(136,68,255,0.8)]"
            style={{
              transform: `translate(${r.x}px, ${r.y}px)`,
              animation: `runeFade 4s ease-in-out ${r.delay}s forwards`
            }}>
            {r.char}
          </div>
        ))}
      </div>

      {/* Orbiting particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `orbit${p.isCW ? "CW" : "CCW"} ${p.duration}s linear ${p.delay}s infinite`,
            transformOrigin: `${p.radius}px 0`,
            left: "50%",
            top: "50%",
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
        />
      ))}

      {/* Crystal gem */}
      <button
        data-testid="crystal-click-target"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative z-10 cursor-pointer border-0 bg-transparent p-0 focus:outline-none"
        style={{
          animation: "floatCrystal 3s ease-in-out infinite, colorShift 8s infinite alternate",
          transform: `scale(${clicked ? 1.15 : hovered ? 1.05 : 1})`,
          transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {/* Outer glow halo - intensified on hover */}
        <div
          className="absolute rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            inset: "-40px",
            background: "radial-gradient(circle, rgba(136,68,255,0.4) 0%, transparent 70%)",
            animation: "glowPulse 2s ease-in-out infinite",
            opacity: hovered ? 1 : 0.6
          }}
        />

        {/* SVG Crystal polygon */}
        <svg
          width="220"
          height="240"
          viewBox="0 0 200 220"
          style={{
            filter: `drop-shadow(0 0 ${hovered ? '30px' : '20px'} rgba(136,68,255,0.9)) drop-shadow(0 0 ${hovered ? '60px' : '40px'} rgba(100,40,220,0.6))`,
            animation: "spinSlow 12s linear infinite",
            transition: "filter 0.3s ease",
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

          {/* Main crystal body */}
          <polygon points="100,20 60,80 140,80" fill="url(#faceGrad1)" opacity="0.95" />
          <polygon points="100,20 30,110 60,80" fill="url(#faceGrad2)" opacity="0.9" />
          <polygon points="100,20 170,110 140,80" fill="url(#faceGrad1)" opacity="0.85" />
          <polygon points="30,110 60,80 50,150" fill="url(#faceGrad3)" opacity="0.88" />
          <polygon points="60,80 140,80 100,155" fill="url(#crystalGrad)" opacity="0.92" />
          <polygon points="140,80 170,110 150,150" fill="url(#faceGrad2)" opacity="0.86" />
          <polygon points="50,150 100,155 80,200" fill="url(#faceGrad3)" opacity="0.9" />
          <polygon points="100,155 150,150 100,200" fill="url(#crystalGrad)" opacity="0.88" />
          <polygon points="150,150 170,110 100,200" fill="url(#faceGrad2)" opacity="0.85" />
          <polygon points="30,110 50,150 80,200" fill="url(#faceGrad1)" opacity="0.82" />
          <polygon points="80,200 100,200 100,155" fill="url(#faceGrad3)" opacity="0.9" />

          {/* Specular highlight */}
          <polygon points="100,20 60,80 80,50" fill="white" opacity="0.3" />
          <polygon points="100,20 80,50 100,45" fill="white" opacity="0.5" />

          {/* Inner glow core */}
          <ellipse cx="100" cy="110" rx="30" ry="40"
            fill="rgba(220,180,255,0.2)" filter="url(#innerGlow)" />
        </svg>

        {/* Radial Pulse Effect on Click */}
        {clicked && (
          <div
            className="absolute inset-0 rounded-full border-4 border-[#cc99ff] pointer-events-none mix-blend-screen"
            style={{ 
              animation: "radialPulse 0.4s ease-out forwards",
              boxShadow: "0 0 20px #cc99ff, inset 0 0 20px #cc99ff"
            }}
          />
        )}
      </button>

      {/* Bottom atmospheric fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(10,5,30,0.9) 0%, transparent 100%)" }}
      />

      <style>{`
        @keyframes floatCrystal {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes colorShift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(25deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
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
        @keyframes radialPulse {
          0% { transform: scale(0.5); opacity: 1; border-width: 8px; }
          100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
        }
        @keyframes runeFade {
          0% { opacity: 0; transform: scale(0.5) translateY(0); }
          20% { opacity: 0.8; transform: scale(1.2) translateY(-10px); }
          80% { opacity: 0.5; transform: scale(1) translateY(-20px); }
          100% { opacity: 0; transform: scale(0.8) translateY(-30px); }
        }
      `}</style>
    </div>
  );
}