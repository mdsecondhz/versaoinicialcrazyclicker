import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { useGameState } from "./hooks/useGameState";
import { useClickEffect } from "./hooks/useClickEffect";
import { GameScene } from "./components/GameScene";
import { HUD } from "./components/HUD";
import { UpgradePanel } from "./components/UpgradePanel";
import { formatNumber } from "./lib/utils";
import { ChatBot } from "./components/ChatBot";
import { TranslationToggle } from "./components/TranslationToggle";
import { LanguageProvider } from "./context/LanguageContext";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#8844ff",
    colorForeground: "#e8e0f8",
    colorMutedForeground: "#8a7aaa",
    colorDanger: "#cc3333",
    colorBackground: "#0f0a1e",
    colorInput: "#1a1030",
    colorInputForeground: "#e8e0f8",
    colorNeutral: "#3a2a5a",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0f0a1e] border border-[#3a2a5a] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_0_40px_rgba(136,68,255,0.3)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#e8e0f8] font-bold",
    headerSubtitle: "text-[#8a7aaa]",
    socialButtonsBlockButtonText: "text-[#e8e0f8]",
    formFieldLabel: "text-[#e8e0f8]",
    footerActionLink: "text-[#8844ff]",
    footerActionText: "text-[#8a7aaa]",
    dividerText: "text-[#8a7aaa]",
    identityPreviewEditButton: "text-[#8844ff]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-[#e8e0f8]",
    logoBox: "flex justify-center",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border-[#3a2a5a] bg-[#1a1030] hover:bg-[#2a1a40]",
    formButtonPrimary: "bg-[#8844ff] hover:bg-[#6622dd] text-white",
    formFieldInput: "bg-[#1a1030] border-[#3a2a5a] text-[#e8e0f8]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#3a2a5a]",
    alert: "bg-[#1a1030] border-[#3a2a5a]",
    otpCodeFieldInput: "bg-[#1a1030] border-[#3a2a5a] text-[#e8e0f8]",
    formFieldRow: "",
    main: "",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClientInstance = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClientInstance.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClientInstance]);

  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a1a] px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a1a] px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function Game() {
  const { isSignedIn } = useUser();
  const { state, clickCrystal, buyUpgrade, getUpgradeCost, isSaving, isCloudSyncing } = useGameState(isSignedIn ?? false);
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
        isCloudSyncing={isCloudSyncing}
      />
      
      <TranslationToggle />
      <ChatBot />
      
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
          className="absolute z-50 text-accent font-bold text-xl pointer-events-none drop-shadow-[0_0_10px_rgba(255,215,0,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
          style={{
            left: popup.x,
            top: popup.y - 20,
            transform: 'translate(-50%, -100%)',
            animation: 'floatUpAndFade 1.2s cubic-bezier(0.1, 0.9, 0.2, 1) forwards'
          }}
        >
          +{formatNumber(popup.amount)}
        </div>
      ))}
      
      <style>{`
        @keyframes floatUpAndFade {
          0% { opacity: 1; transform: translate(-50%, 0) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -40px) scale(1.5); }
          50% { opacity: 1; transform: translate(-50%, -60px) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -120px) scale(1); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); box-shadow: 0 0 15px rgba(136,68,255,0.4); }
          50% { opacity: 1; transform: scale(1.05); box-shadow: 0 0 30px rgba(136,68,255,0.8); }
        }
      `}</style>
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <LanguageProvider>
          <Switch>
            <Route path="/" component={Game} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
          </Switch>
        </LanguageProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;