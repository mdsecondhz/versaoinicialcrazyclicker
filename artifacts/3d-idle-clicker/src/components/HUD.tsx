import { formatNumber } from "@/lib/utils";

interface HUDProps {
  energy: number;
  energyPerSecond: number;
  isSaving: boolean;
}

export function HUD({ energy, energyPerSecond, isSaving }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-6 flex flex-col items-center pointer-events-none z-10 text-center drop-shadow-md">
      <div className="text-sm tracking-widest text-muted-foreground uppercase font-semibold mb-1">Arcane Energy</div>
      <div className="text-5xl font-bold text-primary-foreground tracking-tight drop-shadow-[0_0_8px_rgba(136,68,255,0.8)]">
        {formatNumber(energy)}
      </div>
      <div className="text-sm font-medium text-accent mt-2 drop-shadow-[0_0_4px_rgba(255,215,0,0.5)]">
        +{formatNumber(energyPerSecond)} / sec
      </div>
      
      {isSaving && (
        <div className="absolute top-6 right-6 flex items-center gap-2 text-xs text-muted-foreground bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Saving...
        </div>
      )}
    </div>
  );
}
