import React, { useState } from 'react';
import { signIn, signUp } from '../utils/auth';
import { authSchema } from '../schemas';
import { loginLimiter, protectedAction } from '../utils/rateLimiter';
import { sanitizeInput, reportError } from '../utils/security';
import { useNavigate } from 'react-router-dom';

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const accountCreated = !!localStorage.getItem('accountCreated');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const safeEmail = sanitizeInput(email);
    const safePassword = sanitizeInput(password);
    try {
      authSchema.parse({ email: safeEmail, password: safePassword });
    } catch (validationError) {
      setError(validationError.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await protectedAction(loginLimiter, `login_${safeEmail}`);
      if (mode === 'login') {
        await signIn(safeEmail, safePassword);
      } else {
        const { session } = await signUp(safeEmail, safePassword);
        if (!session) {
          setError('Compte créé. Vérifiez votre email pour confirmer avant de continuer.');
          return;
        }
        localStorage.setItem('accountCreated', '1');
      }
      onAuthenticated?.();
    } catch (err) {
      reportError(err, { feature: 'auth', mode });
      setError(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-scale-up">
      {mode === 'signup' && (
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-2 bg-zinc-800 text-white rounded-md mb-4 hover:bg-zinc-700 transition-colors"
        >
          Retour
        </button>
      )}
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
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#c28e3a] outline-none transition-colors"
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
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#c28e3a] outline-none transition-colors"
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-950/30 border border-red-800/40 rounded-xl px-4 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl disabled:opacity-50 hover:brightness-110 transition-all active:scale-95"
        >
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>
      </form>
      {(!accountCreated || mode === 'signup') && (
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          className="w-full text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          {mode === 'login' ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
        </button>
      )}
    </div>
  );
}