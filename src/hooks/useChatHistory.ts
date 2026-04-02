import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  title: string;
  last_message_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_MSG: Message = {
  role: 'assistant',
  content: "Hey there! I'm your AI trading mentor. Ask me about the Triple Screen system, risk management, trading psychology, or institutional positioning — I'm here to help you level up your trading game.",
};

export function useChatHistory() {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_MSG]);
  const [loading, setLoading] = useState(false);

  // Listen for auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load conversation list when user changes
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([DEFAULT_MSG]);
      return;
    }
    loadConversations();
  }, [userId]);

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('chat_conversations')
      .select('id, title, last_message_at')
      .order('last_message_at', { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  }, [userId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setActiveConversationId(conversationId);
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (data && data.length > 0) {
      setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    } else {
      setMessages([DEFAULT_MSG]);
    }
    setLoading(false);
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([DEFAULT_MSG]);
  }, []);

  const saveMessages = useCallback(async (msgs: Message[]) => {
    if (!userId || msgs.length <= 1) return;

    let convId = activeConversationId;

    // Derive title from first user message
    const firstUserMsg = msgs.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 80) : 'New Conversation';

    if (!convId) {
      const { data } = await supabase
        .from('chat_conversations')
        .insert({ user_id: userId, title })
        .select('id')
        .single();
      if (!data) return;
      convId = data.id;
      setActiveConversationId(convId);
    } else {
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString(), title })
        .eq('id', convId);
    }

    // Delete old messages and re-insert (simpler than diffing)
    await supabase.from('chat_messages').delete().eq('conversation_id', convId);
    const rows = msgs.map(m => ({ conversation_id: convId!, role: m.role, content: m.content }));
    await supabase.from('chat_messages').insert(rows);

    loadConversations();
    return convId;
  }, [userId, activeConversationId, loadConversations]);

  const deleteConversation = useCallback(async (convId: string) => {
    await supabase.from('chat_conversations').delete().eq('id', convId);
    if (activeConversationId === convId) {
      startNewConversation();
    }
    loadConversations();
  }, [activeConversationId, startNewConversation, loadConversations]);

  return {
    userId,
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loading,
    loadMessages,
    startNewConversation,
    saveMessages,
    deleteConversation,
    DEFAULT_MSG,
  };
}
