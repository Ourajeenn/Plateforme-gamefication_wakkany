import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signUp } from '../utils/auth';
import { authSchema } from '../schemas';
import { loginLimiter, protectedAction } from '../utils/rateLimiter';
import { sanitizeInput, reportError } from '../utils/security';

export default function AuthForm({ onAuthenticated, defaultMode = 'signup' }) {
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const safeEmail = sanitizeInput(email);
    const safePassword = sanitizeInput(password);

    if (mode === 'signup' && safePassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      authSchema.parse({ email: safeEmail, password: safePassword });
    } catch (validationError) {
      setError(validationError.errors[0]?.message || 'Données invalides.');
      return;
    }

    setLoading(true);
    try {
      await protectedAction(loginLimiter, `login_${safeEmail}`);
      if (mode === 'login') {
        await signIn(safeEmail, safePassword);
        onAuthenticated?.();
      } else {
        const { session } = await signUp(safeEmail, safePassword, {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        if (!session) {
          setSuccessMessage('Compte créé ! Vérifiez votre boîte email (et votre dossier Spam/Courrier indésirable) pour valider votre compte.');
          // Auto-continue to setup after a short delay so user is not blocked
          setTimeout(() => {
            onAuthenticated?.();
          }, 1500);
          return;
        }
        localStorage.setItem('accountCreated', '1');
        onAuthenticated?.();
      }
    } catch (err) {
      reportError(err, { feature: 'auth', mode });
      const msg = err.message || "Erreur d'authentification";
      if (msg.includes('User already registered') || msg.includes('already in use')) {
        setError('Cet email est déjà enregistré. Veuillez basculer sur Connexion.');
      } else if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Segmented Mode Selector: Créer un compte / Connexion */}
      <div className="grid grid-cols-2 p-1.5 bg-black/60 rounded-2xl border border-white/10 relative select-none">
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
          className={`relative py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors z-10 ${
            mode === 'signup' ? 'text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {mode === 'signup' && (
            <motion.div
              layoutId="authActiveTab"
              className="absolute inset-0 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] rounded-xl shadow-md -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          Créer un compte
        </button>

        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
          className={`relative py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors z-10 ${
            mode === 'login' ? 'text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {mode === 'login' && (
            <motion.div
              layoutId="authActiveTab"
              className="absolute inset-0 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] rounded-xl shadow-md -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          Se connecter
        </button>
      </div>

      {/* Explanatory subtitle */}
      <div className="text-center">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
          {mode === 'signup' ? 'Nouvel Enregistrement' : 'Reprise de Session'}
        </p>
        <h2 className="text-white text-xl sm:text-2xl font-heading font-bold italic uppercase tracking-tight">
          {mode === 'signup' ? 'Rejoignez la Meute' : 'Bon retour, Chasseur'}
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          {mode === 'signup'
            ? 'Sauvegardez vos talents, votre XP et vos succès dans le multivers.'
            : 'Retrouvez votre clan et votre progression synchronisée.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
            Adresse Email
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 pr-12 text-white placeholder-zinc-600 focus:border-[#c28e3a] focus:ring-1 focus:ring-[#c28e3a] outline-none transition-all text-sm"
              required
              autoComplete="email"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none flex items-center justify-center">
              <iconify-icon icon="mdi:email-outline" width="18" />
            </div>
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              Mot de passe
            </label>
            {mode === 'signup' && (
              <span className="text-[10px] text-zinc-500">Min. 8 caractères</span>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 pr-12 text-white placeholder-zinc-600 focus:border-[#c28e3a] focus:ring-1 focus:ring-[#c28e3a] outline-none transition-all text-sm font-mono"
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              <iconify-icon
                icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                width="18"
              />
            </button>
          </div>
        </div>

        {/* Confirmation du mot de passe (mode signup uniquement) */}
        <AnimatePresence>
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-black/50 border rounded-2xl px-5 py-3.5 text-white placeholder-zinc-600 outline-none transition-all text-sm font-mono ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-white/10 focus:border-[#c28e3a]'
                }`}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages d'erreur & succès */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-red-300 text-xs bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3"
          >
            <iconify-icon icon="mdi:alert-circle" width="16" className="shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-emerald-300 text-xs bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-3"
          >
            <iconify-icon icon="mdi:check-circle" width="16" className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Bouton de validation */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] text-zinc-950 font-black uppercase tracking-[0.2em] text-xs rounded-2xl disabled:opacity-50 transition-all shadow-[0_4px_20px_rgba(217,119,6,0.35)] flex items-center justify-center gap-2 cursor-pointer border border-[#fcd34d]/50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Chargement...</span>
            </>
          ) : (
            <>
              <iconify-icon icon={mode === 'signup' ? 'mdi:paw' : 'mdi:login'} width="18" />
              <span>{mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
