import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useLang } from "../context/LanguageContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLang();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text:
            lang === "pt"
              ? "Saudações, viajante! Como posso guiá-lo no Crazy Clicker?"
              : "Greetings, traveler! How may I guide you in Crazy Clicker?",
          isUser: false,
        },
      ]);
    }
  }, [isOpen, lang, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput("");
    
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), text: userMsg, isUser: true },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, language: lang }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.reply) {
        setMessages([
          ...newMessages,
          { id: (Date.now() + 1).toString(), text: data.reply, isUser: false },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { id: (Date.now() + 1).toString(), text: "Erro na comunicação.", isUser: false },
        ]);
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        { id: (Date.now() + 1).toString(), text: "Erro na comunicação.", isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-6 left-6 z-50 w-14 h-14 bg-primary/20 backdrop-blur-md border border-primary/50 rounded-full flex items-center justify-center text-primary-foreground shadow-[0_0_15px_rgba(136,68,255,0.4)] hover:scale-110 hover:shadow-[0_0_25px_rgba(136,68,255,0.6)] transition-all duration-300 animate-[glowPulse_2s_infinite]"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="absolute bottom-6 left-6 z-50 w-[300px] h-[400px] bg-[#0f0a1e]/90 backdrop-blur-xl border border-[#3a2a5a] rounded-2xl flex flex-col shadow-[0_0_40px_rgba(136,68,255,0.3)] animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center justify-between p-4 border-b border-[#3a2a5a] bg-black/20">
            <h3 className="font-bold text-[#e8e0f8]">
              {lang === "pt" ? "Oráculo do Cristal" : "Crystal Oracle"}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8a7aaa] hover:text-[#e8e0f8] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.isUser
                      ? "bg-accent/20 border border-accent/40 text-[#fff7d6] rounded-tr-sm"
                      : "bg-primary/20 border border-primary/40 text-[#e8e0f8] rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-primary/20 border border-primary/40 rounded-xl rounded-tl-sm px-4 py-3 flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-[#3a2a5a] bg-black/20">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={lang === "pt" ? "Pergunte algo..." : "Ask something..."}
                className="flex-1 bg-[#1a1030] border border-[#3a2a5a] rounded-lg px-3 py-2 text-sm text-[#e8e0f8] focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-primary/20 hover:bg-primary/40 text-primary-foreground rounded-lg border border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}