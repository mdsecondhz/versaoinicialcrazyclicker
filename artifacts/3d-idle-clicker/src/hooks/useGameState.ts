import { useState, useEffect, useCallback, useRef } from "react";

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

const SAVE_KEY = "crazy_clicker_save";

// isSignedIn is passed as a parameter so useUser() stays in the component tree
// where ClerkProvider is guaranteed to be mounted — avoids hooks-order violations.
export function useGameState(isSignedIn: boolean = false) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const initRef = useRef(false);

  // Load from local or cloud on mount / sign-in change
  useEffect(() => {
    const loadState = async () => {
      let localState: GameState | null = null;
      let cloudState: any = null;

      try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) localState = JSON.parse(saved);
      } catch {
        // ignore
      }

      if (isSignedIn) {
        try {
          const res = await fetch("/api/game/save");
          if (res.ok) cloudState = await res.json();
        } catch {
          // ignore
        }
      }

      // Prefer cloud state if it has more energy
      let bestState = localState;
      if (cloudState && (!localState || cloudState.energy > (localState?.energy ?? 0))) {
        const cloudUpgradesObj: Record<string, number> = cloudState.upgradeCounts ?? {};
        let newEnergyPerClick = 1;
        let newEnergyPerSecond = 0;
        const mergedUpgrades = UPGRADES.map(baseUp => {
          const count = cloudUpgradesObj[baseUp.id] ?? 0;
          if (baseUp.effectType === "click") newEnergyPerClick += baseUp.effectValue * count;
          else newEnergyPerSecond += baseUp.effectValue * count;
          return { ...baseUp, count };
        });
        bestState = {
          energy: cloudState.energy ?? 0,
          energyPerClick: newEnergyPerClick,
          energyPerSecond: newEnergyPerSecond,
          upgrades: mergedUpgrades,
          lastSaved: Date.now()
        };
      }

      if (bestState) {
        const mergedUpgrades = UPGRADES.map(baseUp => {
          const savedUp = (bestState!.upgrades ?? []).find((u: any) => u.id === baseUp.id);
          return savedUp ? { ...baseUp, count: savedUp.count } : baseUp;
        });
        let newEnergyPerClick = 1;
        let newEnergyPerSecond = 0;
        mergedUpgrades.forEach(u => {
          if (u.effectType === "click") newEnergyPerClick += u.effectValue * u.count;
          else newEnergyPerSecond += u.effectValue * u.count;
        });
        setState({
          ...INITIAL_STATE,
          ...bestState,
          upgrades: mergedUpgrades,
          energyPerClick: newEnergyPerClick,
          energyPerSecond: newEnergyPerSecond
        });
      }

      initRef.current = true;
    };

    loadState();
  }, [isSignedIn]);

  const saveStateLocal = useCallback((currentState: GameState) => {
    setIsSaving(true);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...currentState, lastSaved: Date.now() }));
    } catch { /* ignore */ }
    setTimeout(() => setIsSaving(false), 500);
  }, []);

  const saveStateCloud = useCallback(async (currentState: GameState) => {
    if (!isSignedIn) return;
    setIsCloudSyncing(true);
    const upgradeCounts: Record<string, number> = {};
    currentState.upgrades.forEach(u => { if (u.count > 0) upgradeCounts[u.id] = u.count; });
    try {
      await fetch("/api/game/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energy: currentState.energy,
          energyPerClick: currentState.energyPerClick,
          energyPerSecond: currentState.energyPerSecond,
          upgradeCounts
        })
      });
    } catch { /* ignore */ }
    setTimeout(() => setIsCloudSyncing(false), 1000);
  }, [isSignedIn]);

  // Local save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => saveStateLocal(state), 5000);
    return () => clearInterval(interval);
  }, [state, saveStateLocal]);

  // Cloud save every 15 seconds
  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(() => saveStateCloud(state), 15000);
    return () => clearInterval(interval);
  }, [state, saveStateCloud, isSignedIn]);

  // Save on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStateLocal(state);
      if (isSignedIn) {
        const upgradeCounts: Record<string, number> = {};
        state.upgrades.forEach(u => { if (u.count > 0) upgradeCounts[u.id] = u.count; });
        navigator.sendBeacon("/api/game/save", new Blob([JSON.stringify({
          energy: state.energy,
          energyPerClick: state.energyPerClick,
          energyPerSecond: state.energyPerSecond,
          upgradeCounts
        })], { type: "application/json" }));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state, saveStateLocal, isSignedIn]);

  // Passive income
  useEffect(() => {
    if (state.energyPerSecond === 0) return;
    const interval = setInterval(() => {
      setState(prev => ({ ...prev, energy: prev.energy + prev.energyPerSecond }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.energyPerSecond]);

  const clickCrystal = useCallback(() => {
    setState(prev => ({ ...prev, energy: prev.energy + prev.energyPerClick }));
  }, []);

  const getUpgradeCost = (upgrade: Upgrade) =>
    Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));

  const buyUpgrade = useCallback((upgradeId: string) => {
    setState(prev => {
      const upgradeIndex = prev.upgrades.findIndex(u => u.id === upgradeId);
      if (upgradeIndex === -1) return prev;
      const upgrade = prev.upgrades[upgradeIndex];
      const cost = getUpgradeCost(upgrade);
      if (prev.energy < cost) return prev;
      const newUpgrades = [...prev.upgrades];
      newUpgrades[upgradeIndex] = { ...upgrade, count: upgrade.count + 1 };
      return {
        ...prev,
        energy: prev.energy - cost,
        upgrades: newUpgrades,
        energyPerClick: upgrade.effectType === "click" ? prev.energyPerClick + upgrade.effectValue : prev.energyPerClick,
        energyPerSecond: upgrade.effectType === "passive" ? prev.energyPerSecond + upgrade.effectValue : prev.energyPerSecond,
      };
    });
  }, []);

  return { state, clickCrystal, buyUpgrade, getUpgradeCost, isSaving, isCloudSyncing };
}
