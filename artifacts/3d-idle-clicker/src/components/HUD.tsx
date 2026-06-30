import { formatNumber } from "@/lib/utils";
import { useLang } from "../context/LanguageContext";
import { t } from "../lib/translations";
import { useUser, useClerk } from "@clerk/react";
import { useLocation } from "wouter";

interface HUDProps {
  energy: number;
  energyPerSecond: number;
  isSaving: boolean;
  isCloudSyncing: boolean;
}

export function HUD({ energy, energyPerSecond, isSaving, isCloudSyncing }: HUDProps) {
  const { lang } = useLang();
  const strings = t[lang];
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-6 flex flex-col items-center pointer-events-none z-10 text-center drop-shadow-md">
        <h1 className="text-2xl font-black text-primary/80 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(136,68,255,0.5)] mb-2">{strings.gameName}</h1>
        <div className="text-sm tracking-widest text-muted-foreground uppercase font-semibold mb-1">{strings.arcaneEnergy}</div>
        <div className="text-5xl font-bold text-primary-foreground tracking-tight drop-shadow-[0_0_8px_rgba(136,68,255,0.8)]">
          {formatNumber(energy)}
        </div>
        <div className="text-sm font-medium text-accent mt-2 drop-shadow-[0_0_4px_rgba(255,215,0,0.5)]">
          +{formatNumber(energyPerSecond)} {strings.perSec}
        </div>
        
        {isCloudSyncing ? (
          <div className="absolute top-20 flex items-center gap-2 text-xs text-[#6622dd] bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-[#6622dd]/30">
            <div className="w-2 h-2 rounded-full bg-[#8844ff] animate-pulse" />
            {strings.syncingCloud}
          </div>
        ) : isSaving ? (
          <div className="absolute top-20 flex items-center gap-2 text-xs text-muted-foreground bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {strings.saving}
          </div>
        ) : null}
      </div>

      <div className="absolute top-6 right-80 mr-6 z-50 flex items-center gap-3">
        {isSignedIn ? (
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#3a2a5a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary text-primary-foreground flex items-center justify-center font-bold shadow-[0_0_10px_rgba(136,68,255,0.3)]">
              {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
            >
              {strings.logOut}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#3a2a5a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setLocation("/sign-in")}
              className="text-xs font-semibold text-muted-foreground hover:text-white px-2 py-1 transition-colors"
            >
              {strings.signIn}
            </button>
            <div className="w-px h-3 bg-[#3a2a5a]" />
            <button 
              onClick={() => setLocation("/sign-up")}
              className="text-xs font-semibold text-primary hover:text-primary-foreground px-2 py-1 transition-colors"
            >
              {strings.signUp}
            </button>
          </div>
        )}
      </div>
    </>
  );
}