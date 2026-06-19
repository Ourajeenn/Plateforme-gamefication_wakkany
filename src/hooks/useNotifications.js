import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';

export default function useNotifications(user) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user || !isSupabaseConfigured()) return;

        let isMounted = true;

        const fetchNotifications = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id;
            
            if (!userId) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (!error && data && isMounted) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        };

        fetchNotifications();

        let channel;
        
        supabase.auth.getSession().then(({ data: sessionData }) => {
            const userId = sessionData?.session?.user?.id;
            if (userId && isMounted) {
                channel = supabase
                    .channel('public:notifications')
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${userId}`
                    }, (payload) => {
                        setNotifications(prev => [payload.new, ...prev].slice(0, 20));
                        setUnreadCount(prev => prev + 1);
                    })
                    .subscribe();
            }
        });

        return () => {
            isMounted = false;
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user]);

    const markAsRead = async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (!isSupabaseConfigured()) return;
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);

        if (!isSupabaseConfigured() || !user) return;
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (userId) {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);
        }
    };

    const addLocalNotification = async (type, message) => {
        const newNotif = {
            id: Date.now().toString(),
            type,
            message,
            read: false,
            created_at: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
        
        if (isSupabaseConfigured() && user) {
             const { data: sessionData } = await supabase.auth.getSession();
             const userId = sessionData?.session?.user?.id;
             if (userId) {
                 supabase.from('notifications').insert([{
                     user_id: userId,
                     type,
                     message
                 }]).then();
             }
        }
    };

    return { notifications, unreadCount, markAsRead, markAllAsRead, addLocalNotification };
}
