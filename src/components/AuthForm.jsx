import React, { useState } from 'react';
import { signIn, signUp } from '../utils/auth';
import { authSchema } from '../schemas';
import { loginLimiter, protectedAction } from '../utils/rateLimiter';

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation Zod stricte
    try {
      authSchema.parse({ email: email.trim(), password });
    } catch (validationError) {
      setError(validationError.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      // Protection anti-brute-force (Rate Limiting)
      await protectedAction(loginLimiter, `login_${email.trim()}`);
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        const { session } = await signUp(email.trim(), password);
        if (!session) {
          setError('Compte créé. Vérifiez votre email pour confirmer avant de continuer.');
          return;
        }
      }
      onAuthenticated?.();
    } catch (err) {
      setError(err.message || 'Erreur d\'authentification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-scale-up">
      <div className="text-center">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Sécurité du Nexus</p>
        <h2 className="text-white text-2xl font-heading font-bold italic uppercase tracking-tighter">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#c28e3a] outline-none"
            required
            autoComplete="email"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#c28e3a] outline-none"
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl disabled:opacity-50"
        >
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        className="w-full text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
      >
        {mode === 'login' ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
      </button>
    </div>
  );
}
