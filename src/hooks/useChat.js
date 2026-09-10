import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';
import { askAssistant } from '../utils/assistant';
import { answerGameQuestion } from '../utils/gameGuide';
import { getOrCreateKeyForUser, encryptText, decryptText } from '../utils/e2ee';

const MOCK_BOT_NAMES = ["Bledja", "Lina", "Kael", "Thorin", "Anya"];

const STORAGE_KEY = 'wakkany_local_chat_messages';

export default function useChat(user) {
  const [messages, setMessages] = useState([]);
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatKey, setChatKey] = useState(null);
  const channelRef = useRef(null);
  const broadcastRef = useRef(null);
  const chatKeyRef = useRef(null);

  useEffect(() => {
    chatKeyRef.current = chatKey;
  }, [chatKey]);

  useEffect(() => {
    if (!user?.id) {
      setChatKey(null);
      return;
    }

    let isCanceled = false;
    getOrCreateKeyForUser(user.id)
      .then((key) => {
        if (!isCanceled) setChatKey(key);
      })
      .catch((err) => {
        console.warn('[E2EE] key init failed', err);
      });

    return () => {
      isCanceled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }

    // ─── CAS 1 : SUPABASE CONFIGURÉ (En ligne / Réel) ─────────────────────────
    if (isSupabaseConfigured()) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          const hydrated = await Promise.all(
            data.reverse().map(async (msg) => ({
              ...msg,
              content: chatKey ? await decryptText(msg.content, chatKey) : msg.content,
            }))
          );
          setMessages(hydrated);
        }
        setLoading(false);
      };

      fetchMessages();

      const channel = supabase
        .channel('public:chat_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        }, (payload) => {
          const decryptAndPush = async () => {
            const newMessage = payload.new;
            const content = chatKeyRef.current
              ? await decryptText(newMessage.content, chatKeyRef.current)
              : newMessage.content;
            setMessages(prev => [...prev, { ...newMessage, content }].slice(-50));
          };
          void decryptAndPush();
        })
        .subscribe();
        
      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    }

    // ─── CAS 2 : EMULATION HORS LIGNE / SUPABASE NON CONFIGURÉ ───────────────
    // Initialisation avec quelques faux messages de base
    const localData = localStorage.getItem(STORAGE_KEY);
    let initialMessages = [];
    if (localData) {
      try {
        initialMessages = JSON.parse(localData);
      } catch {
        initialMessages = [];
      }
    }

    if (initialMessages.length === 0) {
      initialMessages = [
        {
          id: 'mock-1',
          username: 'Bledja',
          content: 'Bienvenue sur le chat global de Wakkany ! Prêt à affronter les failles ? ⚔️',
          academy: 'Force',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'mock-2',
          username: 'Lina',
          content: "J'ai enfin débloqué le sort d'Arcane Tier 3, ça change la vie !",
          academy: 'Arcane',
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMessages));
    }

    setMessages(initialMessages);
    setLoading(false);

    // Synchronisation multi-onglets via BroadcastChannel
    try {
      const bc = new BroadcastChannel('wakkany_global_chat');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_MESSAGE') {
          setMessages(prev => [...prev, event.data.payload].slice(-50));
        }
      };
      broadcastRef.current = bc;
    } catch (e) {
      console.warn("BroadcastChannel not supported", e);
    }

    return () => {
      if (broadcastRef.current) {
        broadcastRef.current.close();
      }
    };
  }, [user, chatKey]);

  // Fonction d'envoi de message
  const sendMessage = async (content) => {
    if (!user || !content.trim()) return false;

    const trimmedContent = content.trim();
    const encryptedContent = chatKey ? await encryptText(trimmedContent, chatKey) : trimmedContent;

    // ─── CAS 1 : SUPABASE CONFIGURÉ ──────────────────────────────────────────
    if (isSupabaseConfigured()) {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) return false;

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: userId,
          username: user.name || 'Joueur Anonyme',
          content: encryptedContent,
          academy: user.academy || null
        }]);
        
      return !error;
    }

    // ─── CAS 2 : EMULATION HORS LIGNE ────────────────────────────────────────
    const newMsg = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      username: user.name || 'Joueur Local',
      content: trimmedContent,
      academy: user.academy || null,
      created_at: new Date().toISOString()
    };

    // Ajout et sauvegarde locale
    setMessages(prev => {
      const updated = [...prev, newMsg].slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Notification des autres onglets
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type: 'NEW_MESSAGE', payload: newMsg });
    }

    // Simulation d'une réponse de bot après 1.5-3.5 secondes en mode hors-ligne
    setTimeout(() => {
          const botName = MOCK_BOT_NAMES[Math.floor(Math.random() * MOCK_BOT_NAMES.length)];
      const botMsgText = answerGameQuestion(trimmedContent, user);
      const botMsg = {
        id: `bot-${Date.now()}`,
        username: botName,
        content: botMsgText,
        academy: ['Force', 'Arcane', 'Ombre'][Math.floor(Math.random() * 3)],
        created_at: new Date().toISOString()
      };

      setMessages(prev => {
        const updated = [...prev, botMsg].slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'NEW_MESSAGE', payload: botMsg });
      }
    }, 1500 + Math.random() * 2000);

    return true;
  };

  const sendAssistantMessage = async (content) => {
    if (!user || !content.trim()) return false;

    const trimmedContent = content.trim();
    const userMessage = {
      id: `assistant-user-${Date.now()}`,
      username: user.name || 'Moi',
      content: trimmedContent,
      academy: user.academy || null,
      created_at: new Date().toISOString(),
      assistant: true,
    };
    setAssistantMessages(prev => [...prev, userMessage].slice(-50));

    const answer = await askAssistant(trimmedContent, user);
    const assistantMsg = {
      id: `assistant-bot-${Date.now()}`,
      username: 'Wakkany Assistant',
      content: answer,
      academy: 'assistant',
      created_at: new Date().toISOString(),
      assistant: true,
    };
    setAssistantMessages(prev => [...prev, assistantMsg].slice(-50));

    return true;
  };

  return { messages, sendMessage, assistantMessages, sendAssistantMessage, loading };
}
