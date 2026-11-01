import React, { useEffect, useState } from 'react';
import { fetchRecentActivity, subscribeActivity } from '../../utils/activityFeed';

export default function ActivityList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;
    fetchRecentActivity(5).then((rows) => { if (active) setEvents(rows); });
    const unsubscribe = subscribeActivity((row) => {
      setEvents((prev) => [row, ...prev.filter((e) => e.id !== row.id)].slice(0, 5));
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  if (events.length === 0) {
    return <p className="text-zinc-700 text-xs italic py-4">Aucune activité récente détectée sur le Nexus...</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-[#c28e3a]/10 flex items-center justify-center border border-[#c28e3a]/20">
            <iconify-icon icon={event.message.startsWith('a terminé') ? 'mdi:scroll' : 'mdi:git-branch'} className="text-[#c28e3a]" width="14"></iconify-icon>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-zinc-300 truncate">
              <span className="text-white font-bold">{event.pseudo}</span> {event.message}
            </p>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">
              {new Date(event.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
