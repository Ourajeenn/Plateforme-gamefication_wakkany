import React, { useEffect, useState } from 'react';

export default function NotificationToast({ notifications, removeNotification }) {
    return (
        <div className="fixed top-24 right-8 z-[150] flex flex-col gap-4 pointer-events-none">
            {notifications.map((notif) => (
                <Toast key={notif.id} notif={notif} onRemove={() => removeNotification(notif.id)} />
            ))}
        </div>
    );
}

function Toast({ notif, onRemove }) {
    const [isVisible, setIsVisible] = useState(false);

    const onRemoveRef = React.useRef(onRemove);
    useEffect(() => {
        onRemoveRef.current = onRemove;
    }, [onRemove]);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                if (onRemoveRef.current) onRemoveRef.current();
            }, 500); // Wait for fade out animation
        }, 4000);
        return () => clearTimeout(timer);
    }, []); // Run only once on mount

    const getIcon = () => {
        switch (notif.type) {
            case 'xp': return 'lucide:trending-up';
            case 'achievement': return 'lucide:trophy';
            case 'level': return 'lucide:star';
            default: return 'lucide:bell';
        }
    };

    const getColor = () => {
        switch (notif.type) {
            case 'xp': return '#c28e3a';
            case 'achievement': return '#eab308';
            case 'level': return '#ffffff';
            default: return '#ffffff';
        }
    };

    return (
        <div className={`
            flex items-center gap-4 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl
            transition-all duration-500 transform pointer-events-auto min-w-[300px]
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}>
            <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-900 border border-white/5"
                style={{ color: getColor() }}
            >
                <iconify-icon icon={getIcon()} width="24"></iconify-icon>
            </div>
            
            <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: getColor() }}>
                    {notif.type === 'xp' ? 'Gain d\'XP' : notif.type === 'achievement' ? 'Succès Débloqué' : 'Niveau Supérieur'}
                </p>
                <p className="text-white font-heading font-bold italic uppercase text-sm tracking-tight">
                    {notif.message}
                </p>
            </div>

            <button onClick={() => setIsVisible(false)} className="text-zinc-600 hover:text-white transition-colors">
                <iconify-icon icon="lucide:x" width="16"></iconify-icon>
            </button>
        </div>
    );
}
