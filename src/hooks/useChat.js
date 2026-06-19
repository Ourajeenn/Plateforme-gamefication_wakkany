import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';

export default function useChat(user) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef(null);

    useEffect(() => {
        if (!isSupabaseConfigured() || !user) {
            setLoading(false);
            return;
        }

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (!error && data) {
                setMessages(data.reverse());
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
                setMessages(prev => [...prev, payload.new].slice(-50));
            })
            .subscribe();
            
        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [user]);

    const sendMessage = async (content) => {
        if (!isSupabaseConfigured() || !user || !content.trim()) return false;
        
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        
        if (!userId) return false;

        const { error } = await supabase
            .from('chat_messages')
            .insert([{
                user_id: userId,
                username: user.name || 'Joueur Anonyme',
                content: content.trim(),
                academy: user.academy || null
            }]);
            
        return !error;
    };

    return { messages, sendMessage, loading };
}
