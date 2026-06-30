import { useLang } from "../context/LanguageContext";

export function TranslationToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="absolute top-6 left-6 z-50 flex items-center bg-black/40 backdrop-blur-md rounded-lg border border-[#3a2a5a] overflow-hidden p-1 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <button
        onClick={() => setLang("pt")}
        className={`px-2 py-1 text-xs font-bold transition-all rounded-md ${
          lang === "pt"
            ? "bg-primary text-white shadow-[0_0_10px_rgba(136,68,255,0.6)]"
            : "text-muted-foreground hover:text-white"
        }`}
      >
        PT
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 text-xs font-bold transition-all rounded-md ${
          lang === "en"
            ? "bg-primary text-white shadow-[0_0_10px_rgba(136,68,255,0.6)]"
            : "text-muted-foreground hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}