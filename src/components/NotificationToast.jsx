import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationToast({ notifications, removeNotification }) {
    return (
        <div className="fixed top-24 right-8 z-[150] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <Toast key={notif.id} notif={notif} onRemove={() => removeNotification(notif.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function Toast({ notif, onRemove }) {
    const duration = notif.duration || 4500;
    const [isHovered, setIsHovered] = useState(false);
    const remainingRef = useRef(duration);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);
    const onRemoveRef = useRef(onRemove);

    useEffect(() => {
        onRemoveRef.current = onRemove;
    }, [onRemove]);

    const closeToast = () => {
        if (onRemoveRef.current) onRemoveRef.current();
    };

    useEffect(() => {
        startTimeRef.current = Date.now();
        timerRef.current = setTimeout(() => {
            closeToast();
        }, remainingRef.current);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            const elapsed = Date.now() - (startTimeRef.current || Date.now());
            remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (remainingRef.current > 0) {
            startTimeRef.current = Date.now();
            timerRef.current = setTimeout(() => {
                closeToast();
            }, remainingRef.current);
        } else {
            closeToast();
        }
    };

    const getIcon = () => {
        switch (notif.type) {
            case 'xp': return 'mdi:trending-up';
            case 'achievement': return 'mdi:trophy';
            case 'level': return 'mdi:star';
            case 'chat': return 'mdi:message-square';
            case 'error': return 'mdi:alert-circle';
            case 'success': return 'mdi:check-circle';
            case 'info': return 'mdi:info';
            default: return 'mdi:bell';
        }
    };

    const getColor = () => {
        switch (notif.type) {
            case 'xp': return '#c28e3a'; // gold
            case 'achievement': return '#eab308'; // yellow
            case 'level': return '#ffffff'; // white
            case 'chat': return '#3b82f6'; // blue
            case 'error': return '#ef4444'; // red
            case 'success': return '#22c55e'; // green
            case 'info': return '#a855f7'; // purple
            default: return '#c28e3a';
        }
    };

    const color = getColor();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative overflow-hidden flex items-center gap-4 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl pointer-events-auto min-w-[300px] hover:border-white/20 hover:scale-[1.02] transition-all duration-200"
        >
            <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-900/90 border border-white/5 shrink-0"
                style={{ color }}
            >
                <iconify-icon icon={getIcon()} width="22"></iconify-icon>
            </div>
            
            <div className="flex-1 pr-2 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color }}>
                        {notif.type === 'xp' ? 'Gain d\'XP' 
                         : notif.type === 'achievement' ? 'Succès Débloqué' 
                         : notif.type === 'level' ? 'Niveau Supérieur'
                         : notif.type === 'chat' ? 'Nouveau Message'
                         : notif.type === 'error' ? 'Erreur'
                         : notif.type === 'success' ? 'Succès'
                         : notif.type === 'info' ? 'Information'
                         : 'Notification'}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                        {Math.round(duration / 1000)}s
                    </span>
                </div>
                <p className="text-white font-heading font-bold italic uppercase text-sm tracking-tight truncate">
                    {notif.message}
                </p>
            </div>

            <button 
                onClick={closeToast} 
                aria-label="Fermer la notification"
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
            >
                <iconify-icon icon="mdi:close" width="16"></iconify-icon>
            </button>

            {/* Barre de durée d'affichage animée */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 overflow-hidden">
                <div 
                    className="h-full origin-left"
                    style={{
                        backgroundColor: color,
                        animation: `notifDuration ${duration}ms linear forwards`,
                        animationPlayState: isHovered ? 'paused' : 'running',
                    }}
                />
            </div>
            <style>{`
                @keyframes notifDuration {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </motion.div>
    );
}
