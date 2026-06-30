import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useLang } from "../context/LanguageContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isError?: boolean;
}

const ERROR_MESSAGES: Record<string, { pt: string; en: string }> = {
  quota_exceeded: {
    pt: "⚠️ A chave da OpenAI não tem créditos suficientes. Acesse platform.openai.com/billing para adicionar créditos.",
    en: "⚠️ The OpenAI key has no credits. Visit platform.openai.com/billing to add credits.",
  },
  invalid_key: {
    pt: "⚠️ Chave da OpenAI inválida. Verifique a variável OPENAI_API_KEY.",
    en: "⚠️ Invalid OpenAI key. Check the OPENAI_API_KEY environment variable.",
  },
  server_error: {
    pt: "O oráculo está em silêncio... Tente novamente mais tarde.",
    en: "The oracle is silent... Try again later.",
  },
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLang();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text:
            lang === "pt"
              ? "Saudações, viajante! Sou o Oráculo do Cristal. Como posso guiá-lo em Crazy Clicker?"
              : "Greetings, traveler! I am the Crystal Oracle. How may I guide you in Crazy Clicker?",
          isUser: false,
        },
      ]);
    }
  }, [isOpen, lang, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const appendMessage = (msg: Omit<Message, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString() + Math.random() }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    appendMessage({ text, isUser: true });
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language: lang }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        appendMessage({ text: data.reply, isUser: false });
      } else {
        const errorKey = (data?.error as string) ?? "server_error";
        const errorMsg = ERROR_MESSAGES[errorKey]?.[lang] ?? ERROR_MESSAGES.server_error[lang];
        appendMessage({ text: errorMsg, isUser: false, isError: true });
      }
    } catch {
      appendMessage({
        text: lang === "pt"
          ? "Não foi possível conectar ao servidor. Verifique sua conexão."
          : "Could not connect to the server. Check your connection.",
        isUser: false,
        isError: true,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title={lang === "pt" ? "Oráculo do Cristal" : "Crystal Oracle"}
          className="absolute bottom-6 left-6 z-50 w-14 h-14 bg-primary/20 backdrop-blur-md border border-primary/50 rounded-full flex items-center justify-center text-primary-foreground shadow-[0_0_15px_rgba(136,68,255,0.4)] hover:scale-110 hover:shadow-[0_0_25px_rgba(136,68,255,0.6)] transition-all duration-300 animate-[glowPulse_2s_infinite]"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="absolute bottom-6 left-6 z-50 w-[320px] h-[420px] bg-[#0f0a1e]/95 backdrop-blur-xl border border-[#3a2a5a] rounded-2xl flex flex-col shadow-[0_0_40px_rgba(136,68,255,0.3)] animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a2a5a] bg-black/30 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔮</span>
              <h3 className="font-bold text-[#e8e0f8] text-sm">
                {lang === "pt" ? "Oráculo do Cristal" : "Crystal Oracle"}
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8a7aaa] hover:text-[#e8e0f8] transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.isUser
                      ? "bg-[#4a1a8a]/60 border border-[#6a2aaa]/50 text-[#fff7d6] rounded-tr-sm"
                      : msg.isError
                      ? "bg-red-950/40 border border-red-800/40 text-red-200 rounded-tl-sm"
                      : "bg-[#1a0a3a]/80 border border-[#3a2a5a]/70 text-[#e8e0f8] rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1a0a3a]/80 border border-[#3a2a5a]/70 rounded-xl rounded-tl-sm px-4 py-3 flex gap-1">
                  <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#3a2a5a] bg-black/20 rounded-b-2xl shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={lang === "pt" ? "Pergunte algo..." : "Ask something..."}
                disabled={isLoading}
                className="flex-1 bg-[#1a1030] border border-[#3a2a5a] rounded-lg px-3 py-2 text-sm text-[#e8e0f8] placeholder-[#4a3a6a] focus:outline-none focus:border-primary/60 disabled:opacity-60 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-primary/20 hover:bg-primary/40 active:bg-primary/60 text-primary-foreground rounded-lg border border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
