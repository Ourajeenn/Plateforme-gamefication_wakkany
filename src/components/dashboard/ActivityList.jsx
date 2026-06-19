import React, { useEffect, useState } from 'react';
import { realtime } from '../../utils/realtime';

export default function ActivityList() {
  const [events, setEvents] = useState(realtime.getEvents());

  useEffect(() => {
    const unsubscribe = realtime.subscribe((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 5));
    });
    return unsubscribe;
  }, []);

  if (events.length === 0) {
    return <p className="text-zinc-700 text-xs italic py-4">Aucune activité récente détectée sur le Nexus...</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-[#c28e3a]/10 flex items-center justify-center border border-[#c28e3a]/20">
            <iconify-icon icon={event.type === 'QUEST_COMPLETE' ? 'lucide:scroll' : 'lucide:git-branch'} className="text-[#c28e3a]" width="14"></iconify-icon>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-zinc-300 truncate">
              <span className="text-white font-bold">{event.user}</span> {event.message}
            </p>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{event.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
