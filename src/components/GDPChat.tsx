import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import mark from "@/assets/gdp-explainer-mark.jpg";

export interface GDPChatRow {
  country: string;
  currency: string;
  gdp: number;
  previous: number;
  forecast: number;
  source: string;
}

const STORAGE_KEY = "mia-gdp-chat-v1";

const loadMessages = (): UIMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const SUGGESTIONS = [
  "Why is the US growth forecast lower than now?",
  "Explain New Zealand's GDP rebound in simple terms",
  "Which economy is growing fastest and what does it mean for its currency?",
  "What does the Eurozone forecast mean for EURUSD?",
];

const GDPChat = ({ rows }: { rows: GDPChatRow[] }) => {
  const [input, setInput] = useState("");
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const initial = useMemo(loadMessages, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gdp-chat`,
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: () => ({ gdp: rowsRef.current }),
      }),
    []
  );

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    id: "gdp-explainer",
    messages: initial,
    transport,
    onError: (e) => {
      const msg = e?.message ?? "";
      if (msg.includes("429")) toast.error("Too many questions right now. Please wait a moment.");
      else if (msg.includes("402")) toast.error("The GDP assistant is temporarily unavailable.");
      else toast.error("Couldn't reach the GDP assistant. Check your connection and try again.");
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        /* storage full or blocked */
      }
    }
  }, [messages, status]);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  };

  const handleSubmit = (m: PromptInputMessage) => ask(m.text ?? "");

  const clear = () => {
    stop();
    setMessages([]);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const last = messages[messages.length - 1];
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "user");

  return (
    <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <img src={mark} alt="" className="w-9 h-9 rounded-lg object-cover" width={36} height={36} />
          <div>
            <h3 className="font-bold text-foreground text-sm">Ask the GDP Explainer</h3>
            <p className="text-xs text-foreground/70">AI-powered plain-language answers about the figures above</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} className="text-foreground/70">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> New conversation
          </Button>
        )}
      </div>

      <Conversation className="h-[420px]">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<img src={mark} alt="" className="w-12 h-12 rounded-xl object-cover" />}
              title="Ask about any country's growth"
              description="Get a simple explanation of the current figure, the change from last quarter and what the forecast means for the currency."
            >
              <div className="flex flex-col items-center gap-3">
                <img src={mark} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">Ask about any country's growth</p>
                  <p className="text-xs text-foreground/70 mt-1 max-w-md">
                    Get a simple explanation of the current figure, the change from last quarter and what the forecast means for the currency.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-xl">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="text-xs rounded-full border border-border/50 bg-background/40 px-3 py-1.5 text-foreground/85 hover:border-primary/50 hover:text-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent
                  className={
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-foreground"
                  }
                >
                  {m.parts.map((part, i) =>
                    part.type === "text" ? (
                      m.role === "assistant" ? (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      ) : (
                        <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                      )
                    ) : null
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {waiting && (
            <Message from="assistant">
              <MessageContent className="bg-transparent">
                <Shimmer>Reading the GDP figures…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && !busy && (
            <p className="text-xs text-destructive px-1">The last answer didn't finish. Ask again to retry.</p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="p-4 border-t border-border/30">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="e.g. Why is Japan's forecast lower than its current growth?"
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !input.trim()} />
          </PromptInputFooter>
        </PromptInput>
        <p className="text-[10px] text-foreground/60 mt-2 text-center">
          Educational explanations only, not financial advice. Answers use the GDP figures shown on this page.
        </p>
      </div>
    </div>
  );
};

export default GDPChat;
