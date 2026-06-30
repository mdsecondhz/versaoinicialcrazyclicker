import { useState, useEffect, useCallback } from "react";

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effectType: "click" | "passive";
  effectValue: number;
  count: number;
}

export interface GameState {
  energy: number;
  energyPerClick: number;
  energyPerSecond: number;
  upgrades: Upgrade[];
  lastSaved: number;
}

const UPGRADES: Upgrade[] = [
  { id: "mana-tap", name: "Mana Tap", description: "Sharpens your touch.", baseCost: 10, costMultiplier: 1.15, effectType: "click", effectValue: 1, count: 0 },
  { id: "crystal-shard", name: "Crystal Shard", description: "A fragment that pulses.", baseCost: 50, costMultiplier: 1.15, effectType: "passive", effectValue: 0.5, count: 0 },
  { id: "rune-carver", name: "Rune Carver", description: "Ancient markings amplify power.", baseCost: 200, costMultiplier: 1.15, effectType: "click", effectValue: 2, count: 0 },
  { id: "ley-line-tap", name: "Ley Line Tap", description: "Draws from deeper currents.", baseCost: 500, costMultiplier: 1.15, effectType: "passive", effectValue: 3, count: 0 },
  { id: "arcane-lens", name: "Arcane Lens", description: "Focus the raw power.", baseCost: 2000, costMultiplier: 1.15, effectType: "click", effectValue: 10, count: 0 },
  { id: "void-siphon", name: "Void Siphon", description: "Pulls energy from nowhere.", baseCost: 8000, costMultiplier: 1.15, effectType: "passive", effectValue: 20, count: 0 },
  { id: "storm-core", name: "Storm Core", description: "The crystal drinks lightning.", baseCost: 30000, costMultiplier: 1.15, effectType: "click", effectValue: 50, count: 0 },
  { id: "singularity", name: "Singularity", description: "Reality bends around it.", baseCost: 100000, costMultiplier: 1.15, effectType: "passive", effectValue: 200, count: 0 }
];

const INITIAL_STATE: GameState = {
  energy: 0,
  energyPerClick: 1,
  energyPerSecond: 0,
  upgrades: UPGRADES,
  lastSaved: Date.now()
};

const SAVE_KEY = "crystal_forge_save";

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved upgrades with base upgrades to handle additions/changes
        const mergedUpgrades = UPGRADES.map(baseUp => {
          const savedUp = parsed.upgrades?.find((u: any) => u.id === baseUp.id);
          return savedUp ? { ...baseUp, count: savedUp.count } : baseUp;
        });
        setState({
          ...INITIAL_STATE,
          ...parsed,
          upgrades: mergedUpgrades
        });
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
  }, []);

  const saveState = useCallback((currentState: GameState) => {
    setIsSaving(true);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...currentState,
        lastSaved: Date.now()
      }));
    } catch (e) {
      console.error("Failed to save", e);
    }
    setTimeout(() => setIsSaving(false), 500);
  }, []);

  // Save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveState(state);
    }, 5000);
    return () => clearInterval(interval);
  }, [state, saveState]);

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => saveState(state);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state, saveState]);

  // Passive income tick (every 1 second)
  useEffect(() => {
    if (state.energyPerSecond === 0) return;
    
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        energy: prev.energy + prev.energyPerSecond
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.energyPerSecond]);

  const clickCrystal = useCallback(() => {
    setState(prev => ({
      ...prev,
      energy: prev.energy + prev.energyPerClick
    }));
  }, []);

  const getUpgradeCost = (upgrade: Upgrade) => {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
  };

  const buyUpgrade = useCallback((upgradeId: string) => {
    setState(prev => {
      const upgradeIndex = prev.upgrades.findIndex(u => u.id === upgradeId);
      if (upgradeIndex === -1) return prev;
      
      const upgrade = prev.upgrades[upgradeIndex];
      const cost = getUpgradeCost(upgrade);
      
      if (prev.energy < cost) return prev;
      
      const newUpgrades = [...prev.upgrades];
      newUpgrades[upgradeIndex] = { ...upgrade, count: upgrade.count + 1 };
      
      let newEnergyPerClick = prev.energyPerClick;
      let newEnergyPerSecond = prev.energyPerSecond;
      
      if (upgrade.effectType === "click") {
        newEnergyPerClick += upgrade.effectValue;
      } else {
        newEnergyPerSecond += upgrade.effectValue;
      }
      
      return {
        ...prev,
        energy: prev.energy - cost,
        upgrades: newUpgrades,
        energyPerClick: newEnergyPerClick,
        energyPerSecond: newEnergyPerSecond
      };
    });
  }, []);

  return {
    state,
    clickCrystal,
    buyUpgrade,
    getUpgradeCost,
    isSaving
  };
}
