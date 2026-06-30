import { useEffect } from "react";
import { useGameState } from "./hooks/useGameState";
import { useClickEffect } from "./hooks/useClickEffect";
import { GameScene } from "./components/GameScene";
import { HUD } from "./components/HUD";
import { UpgradePanel } from "./components/UpgradePanel";
import { formatNumber } from "./lib/utils";

function Game() {
  const { state, clickCrystal, buyUpgrade, getUpgradeCost, isSaving } = useGameState();
  const { popups, addPopup } = useClickEffect();

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleCrystalClick = () => {
    clickCrystal();
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // We get window coordinates for popups
    addPopup(e.clientX, e.clientY, state.energyPerClick);
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none font-sans" onPointerDown={handleCanvasPointerDown}>
      <GameScene onCrystalClick={handleCrystalClick} />
      
      <HUD 
        energy={state.energy} 
        energyPerSecond={state.energyPerSecond} 
        isSaving={isSaving} 
      />
      
      <UpgradePanel 
        upgrades={state.upgrades}
        energy={state.energy}
        onBuy={buyUpgrade}
        getUpgradeCost={getUpgradeCost}
      />

      {/* Floating Click Text */}
      {popups.map(popup => (
        <div
          key={popup.id}
          className="absolute z-50 text-accent font-bold text-xl pointer-events-none drop-shadow-[0_0_5px_rgba(255,215,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
          style={{
            left: popup.x,
            top: popup.y - 20,
            transform: 'translate(-50%, -100%)',
            animation: 'floatUpAndFade 1s ease-out forwards'
          }}
        >
          +{formatNumber(popup.amount)}
        </div>
      ))}
      
      <style>{`
        @keyframes floatUpAndFade {
          0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -30px) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -60px) scale(1); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return <Game />;
}

export default App;
