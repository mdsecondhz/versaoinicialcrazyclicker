import { Upgrade } from "@/hooks/useGameState";
import { formatNumber } from "@/lib/utils";

interface UpgradePanelProps {
  upgrades: Upgrade[];
  energy: number;
  onBuy: (id: string) => void;
  getUpgradeCost: (u: Upgrade) => number;
}

export function UpgradePanel({ upgrades, energy, onBuy, getUpgradeCost }: UpgradePanelProps) {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-card/60 backdrop-blur-md border-l border-border/50 p-4 flex flex-col z-10 shadow-2xl overflow-hidden">
      <h2 className="text-xl font-bold text-primary-foreground mb-4 uppercase tracking-wider border-b border-border/50 pb-2">Arcane Focus</h2>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {upgrades.map(upgrade => {
          const cost = getUpgradeCost(upgrade);
          const canAfford = energy >= cost;
          
          return (
            <button
              key={upgrade.id}
              onClick={() => canAfford && onBuy(upgrade.id)}
              disabled={!canAfford}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 relative overflow-hidden group
                ${canAfford 
                  ? "bg-secondary/80 border-primary/30 hover:border-primary hover:bg-secondary cursor-pointer hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(136,68,255,0.3)]" 
                  : "bg-background/40 border-border/30 opacity-60 cursor-not-allowed"}
              `}
            >
              {canAfford && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
              )}
              
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-primary-foreground">{upgrade.name}</div>
                <div className="text-sm font-semibold bg-background/50 px-2 py-0.5 rounded text-accent">Lvl {upgrade.count}</div>
              </div>
              
              <div className="text-xs text-muted-foreground mb-2 italic">"{upgrade.description}"</div>
              
              <div className="flex justify-between items-center text-sm">
                <div className={`${canAfford ? "text-primary-foreground" : "text-destructive"}`}>
                  Cost: <span className="font-bold">{formatNumber(cost)}</span>
                </div>
                <div className="text-accent font-medium text-xs">
                  +{formatNumber(upgrade.effectValue)} {upgrade.effectType === "click" ? "/click" : "/sec"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
