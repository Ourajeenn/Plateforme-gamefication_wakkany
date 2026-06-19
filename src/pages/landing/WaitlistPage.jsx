import { useState } from 'react';

export default function WaitlistPage({ onBack }) {
  const [waitlistStatus, setWaitlistStatus] = useState('idle');

  return (
    <div className="min-h-screen bg-zinc-950 pt-40 px-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} type="button" className="flex items-center gap-2 text-[#c28e3a] uppercase font-bold text-xs tracking-[0.3em] mb-12 hover:gap-4 transition-all">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Back to Home
        </button>
        <h1 className="text-white text-6xl font-heading font-bold italic uppercase mb-8">Join the Elite</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-zinc-400 text-xl font-monda leading-relaxed italic">
              &quot;The Covenant may be broken, but the spirit of the pack remains. Secure your position in the upcoming trials.&quot;
            </p>
            <div className="glass-panel p-8 rounded-3xl">
              <h3 className="text-white font-bold mb-4 uppercase">Registry Requirements</h3>
              <ul className="text-zinc-200 text-sm space-y-3">
                <li>• Level 0 clearance</li>
                <li>• Minimum 100 XP aspiration</li>
                <li>• Engagement pour Wakkany</li>
              </ul>
            </div>
          </div>
          <div className="glass-panel p-10 rounded-3xl">
            {waitlistStatus === 'success' ? (
              <div className="text-center py-12 animate-scale-up">
                <iconify-icon icon="lucide:check-circle" width="64" className="text-[#c28e3a] mb-6"></iconify-icon>
                <h3 className="text-white text-2xl font-bold uppercase mb-4">Transmission Reçue</h3>
                <p className="text-zinc-500 font-monda">Votre signal a été capté. Vous serez informé dès que le portail sera stabilisé.</p>
                <button type="button" onClick={() => setWaitlistStatus('idle')} className="mt-8 text-[#c28e3a] text-xs font-bold uppercase tracking-widest border-b border-[#c28e3a]/20 hover:border-[#c28e3a] transition-all">S&apos;inscrire à nouveau</button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setWaitlistStatus('loading');
                setTimeout(() => setWaitlistStatus('success'), 1500);
              }} className="space-y-6"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Adresse Arthélyonmail</label>
                  <input type="email" required className="w-full bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl text-white outline-none focus:border-[#c28e3a] transition-all" placeholder="wakkany@arthelyon.com" />
                </div>
                <button type="submit" disabled={waitlistStatus === 'loading'} className="w-full py-5 bg-[#c28e3a] text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all font-monda disabled:opacity-50">
                  {waitlistStatus === 'loading' ? 'Chiffrement...' : 'Demander l\'Accès'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
