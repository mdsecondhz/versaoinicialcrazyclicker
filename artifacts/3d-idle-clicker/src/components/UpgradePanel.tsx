import { Upgrade } from "@/hooks/useGameState";
import { formatNumber } from "@/lib/utils";
import { useLang } from "../context/LanguageContext";
import { t } from "../lib/translations";

interface UpgradePanelProps {
  upgrades: Upgrade[];
  energy: number;
  onBuy: (id: string) => void;
  getUpgradeCost: (u: Upgrade) => number;
}

export function UpgradePanel({ upgrades, energy, onBuy, getUpgradeCost }: UpgradePanelProps) {
  const { lang } = useLang();
  const strings = t[lang];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0f0a1e]/80 backdrop-blur-xl border-l border-[#3a2a5a] p-4 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
      <h2 className="text-xl font-bold text-primary-foreground mb-4 uppercase tracking-wider border-b border-primary/30 pb-2 drop-shadow-[0_0_5px_rgba(136,68,255,0.5)]">
        {strings.upgrades}
      </h2>
      
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
                  ? "bg-[#1a1030] border-primary/40 hover:border-primary hover:bg-[#2a1a40] cursor-pointer hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(136,68,255,0.4)]" 
                  : "bg-black/40 border-[#3a2a5a]/50 opacity-60 cursor-not-allowed"}
              `}
            >
              {canAfford && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              )}
              
              <div className="flex justify-between items-start mb-1 relative z-10">
                <div className="font-bold text-[#e8e0f8]">{strings[upgrade.id as keyof typeof strings] || upgrade.name}</div>
                <div className="text-sm font-semibold bg-black/60 px-2 py-0.5 rounded text-accent border border-accent/20">
                  {strings.level} {upgrade.count}
                </div>
              </div>
              
              <div className="text-xs text-[#8a7aaa] mb-2 italic relative z-10">"{strings[`desc-${upgrade.id}` as keyof typeof strings] || upgrade.description}"</div>
              
              <div className="flex justify-between items-center text-sm relative z-10">
                <div className={`${canAfford ? "text-[#e8e0f8]" : "text-destructive"}`}>
                  {strings.cost}: <span className="font-bold">{formatNumber(cost)}</span>
                </div>
                <div className="text-accent font-medium text-xs drop-shadow-[0_0_2px_rgba(255,215,0,0.5)]">
                  +{formatNumber(upgrade.effectValue)} {upgrade.effectType === "click" ? strings.click : strings.perSec}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}