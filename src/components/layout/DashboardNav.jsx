import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { realtime } from '../../utils/realtime';

function LiveFeed() {
  const [events, setEvents] = useState(realtime.getEvents());

  useEffect(() => {
    const unsubscribe = realtime.subscribe((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 5));
    });
    return unsubscribe;
  }, []);

  return (
    <div className="hidden xl:flex items-center gap-6 bg-black/40 border border-white/5 py-2 px-6 rounded-2xl backdrop-blur-xl overflow-hidden max-w-md">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Flux Live</span>
      </div>
      <div className="flex-1 h-8 overflow-hidden relative">
        <div className="flex flex-col gap-1 transition-all duration-500">
          {events.length > 0 ? (
            <div key={events[0].id} className="animate-slide-up py-1">
              <p className="text-[10px] text-zinc-400 font-monda truncate">
                <span className="text-[#c28e3a] font-bold">{events[0].user}</span> {events[0].message}
              </p>
            </div>
          ) : (
            <p className="text-[9px] text-zinc-700 italic py-2">En attente de nouvelles transmissions...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardNav({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full glass-panel border-b border-white/10 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-[60] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3 sm:gap-8 min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group shrink-0" onClick={() => navigate('/')}>
          <iconify-icon icon="lucide:triangle" width="24" height="24" className="text-[#c28e3a] rotate-180 group-hover:rotate-0 transition-transform duration-500"></iconify-icon>
          <span className="text-white font-heading font-bold tracking-widest text-base sm:text-lg italic uppercase">Wakkany</span>
        </div>
        <LiveFeed />
      </div>

      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <div className="hidden md:flex min-w-0 flex-col text-right">
          <span className="text-white font-bold text-sm leading-none truncate max-w-[10rem]">{user?.name || 'Nomade'}</span>
          <span className="text-[#c28e3a] text-[10px] uppercase font-bold tracking-widest truncate max-w-[10rem]">{user?.clan?.name || 'Clanless'}</span>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#c28e3a]/40 overflow-hidden bg-zinc-900/70 flex items-center justify-center shrink-0">
          {user?.clan?.image ? (
            <img src={user.clan.image} alt={`Clan ${user.clan.name}`} className="w-full h-full object-cover" />
          ) : (
            <iconify-icon icon={user?.clan?.icon || 'lucide:user'} className="text-[#c28e3a] text-xl"></iconify-icon>
          )}
        </div>
        <button type="button" onClick={onLogout} className="text-zinc-600 hover:text-red-500 transition-all hover:scale-110 shrink-0">
          <iconify-icon icon="solar:logout-2-linear" width="24"></iconify-icon>
        </button>
      </div>
    </nav>
  );
}
