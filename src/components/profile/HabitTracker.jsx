import React, { useState } from 'react';

export default function HabitTracker({ playScanSFX }) {
  const [checkedDays, setCheckedDays] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const toggleDay = (day) => {
    if (checkedDays.includes(day)) {
      setCheckedDays(prev => prev.filter(d => d !== day));
    } else {
      setCheckedDays(prev => [...prev, day]);
      if (playScanSFX) playScanSFX();
    }
  };

  const calendarProgressPercent = Math.round((checkedDays.length / 31) * 100);

  return (
    <div className="lg:col-span-8 bg-zinc-950 border border-purple-500/10 rounded-3xl p-4 sm:p-8 pt-8 sm:pt-10 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between group">
      
      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
        <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">HABIT TRACKER</span>
      </div>

      <div className="absolute inset-0 bg-radial-gradient from-purple-900/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      
      <div className="mt-4">
        <div className="text-center mb-6">
          <h2 className="text-white text-2xl sm:text-3xl font-heading font-black italic uppercase tracking-[0.25em] sm:tracking-[0.3em] filter drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            MARCH
          </h2>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center border-b border-purple-500/10 pb-4 mb-4">
          {['W-09', 'W-10', 'W-11', 'W-12', 'W-13'].map((week, idx) => (
            <span key={idx} className="text-purple-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">
              {week}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            <div className="flex justify-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-sm sm:text-lg">
                ✓
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-sm sm:text-lg">
                ✓
              </div>
            </div>

            <div className="flex justify-center gap-1 sm:gap-2">
              <div className="w-5 h-8 sm:w-8 sm:h-12 rounded-md sm:rounded-lg bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-xs sm:text-sm">✓</div>
              <div className="w-5 h-8 sm:w-8 sm:h-12 rounded-md sm:rounded-lg bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-xs sm:text-sm">✓</div>
            </div>

            <div className="flex justify-center gap-1 sm:gap-1.5 items-center">
              <div className="w-4 h-7 sm:w-6 sm:h-10 rounded-sm sm:rounded bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-[8px] sm:text-[10px]">✓</div>
              <div className="w-4 h-7 sm:w-6 sm:h-10 rounded-sm sm:rounded bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-[8px] sm:text-[10px]">✓</div>
              <button 
                onClick={() => toggleDay(10)}
                className={`w-5 h-7 sm:w-8 sm:h-10 rounded-sm sm:rounded border font-heading font-black italic text-[9px] sm:text-xs transition-all duration-300 cursor-pointer 
                  ${checkedDays.includes(10) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-900 border-purple-500/25 text-white/80 hover:border-purple-400'}`}
              >
                {checkedDays.includes(10) ? '✓' : '10'}
              </button>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => toggleDay(11)}
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border font-heading font-black italic text-xs sm:text-sm transition-all duration-300 cursor-pointer 
                  ${checkedDays.includes(11) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-900 border-purple-500/25 text-white/80 hover:border-purple-400'}`}
              >
                {checkedDays.includes(11) ? '✓' : '11'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-3 pt-4 border-t border-purple-500/5 text-center">
            {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-md sm:rounded-lg border font-monda font-bold text-[10px] sm:text-xs transition-all duration-300 cursor-pointer flex items-center justify-center
                  ${checkedDays.includes(day) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-950 border-purple-500/10 text-zinc-500 hover:border-purple-400/50 hover:text-white'}`}
              >
                {checkedDays.includes(day) ? '✓' : day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-purple-500/10">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">
          <div className="flex items-center gap-2">
            <iconify-icon icon="lucide:compass" className="text-purple-400 animate-spin-slow" width="14"></iconify-icon>
            <span>GOAL PROGRESS</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{calendarProgressPercent}% COMPLETE</span>
            <iconify-icon icon="lucide:scroll" className="text-purple-400 animate-pulse" width="14"></iconify-icon>
          </div>
        </div>
        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-purple-500/15 relative">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-900 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168, 85, 247, 0.5)] transition-all duration-500 ease-out" 
            style={{ width: `${calendarProgressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
