import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, BookOpen, Loader2, Trash2, History, Plus, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { useChatHistory, type Message } from '@/hooks/useChatHistory';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-chat`;

const TradingBot = () => {
  const {
    userId,
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loading: historyLoading,
    loadMessages,
    startNewConversation,
    saveMessages,
    deleteConversation,
    DEFAULT_MSG,
  } = useChatHistory();

  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true);
    let assistantSoFar = '';

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > allMessages.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (resp.status === 429) {
        toast({ title: 'Rate limited', description: 'Please wait a moment and try again.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: 'Service unavailable', description: 'AI credits exhausted. Please try again later.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('Failed to connect');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore partial */ }
        }
      }
    } catch (e) {
      console.error('Chat error:', e);
      toast({ title: 'Connection error', description: 'Could not reach the AI assistant. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, setMessages]);

  // Auto-save after assistant finishes responding
  useEffect(() => {
    if (!isLoading && userId && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'assistant') {
        saveMessages(messages);
      }
    }
  }, [isLoading]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: inputMessage.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputMessage('');
    streamChat(updated);
  }, [inputMessage, isLoading, messages, streamChat, setMessages]);

  const handleClearChat = () => {
    startNewConversation();
  };

  const handleSelectConversation = (convId: string) => {
    loadMessages(convId);
    setShowHistory(false);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-full p-4"
        >
          <BookOpen className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              {showHistory ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white h-7 w-7 p-0">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  Chat History
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 text-blue-400" />
                  Trading Mentor AI
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              {!showHistory && userId && (
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="text-gray-400 hover:text-white h-7 w-7 p-0" title="Chat history">
                  <History className="w-3.5 h-3.5" />
                </Button>
              )}
              {!showHistory && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-gray-400 hover:text-white h-7 w-7 p-0" title="New chat">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white h-7 w-7 p-0">
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showHistory ? (
            <div className="h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No saved conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                      conv.id === activeConversationId
                        ? 'bg-blue-900/40 text-blue-100'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <span className="truncate flex-1 mr-2">{conv.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-400 h-6 w-6 p-0 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="h-72 overflow-y-auto mb-3 space-y-3 pr-1 scrollbar-thin">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                  </div>
                ) : (
                  messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg text-sm ${
                        message.role === 'assistant'
                          ? 'bg-blue-900/30 text-blue-100'
                          : 'bg-gray-700 text-white ml-6'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  ))
                )}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex items-center gap-2 text-blue-300 text-sm p-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about trading..."
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} size="sm" disabled={isLoading || !inputMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingBot;
