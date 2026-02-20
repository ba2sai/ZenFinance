import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

// Helper component for the Logo
const ZenLogo = ({ size = "normal" }: { size?: "normal" | "large" }) => (
  <div className={`flex items-center gap-2 ${size === "large" ? "scale-125" : ""}`}>
    <div className="relative flex items-center justify-center w-10 h-10 bg-indigo-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50">
      <span className="font-bold text-white text-xl z-10">Z</span>
      <Leaf className="absolute -right-2 -bottom-2 text-emerald-400 drop-shadow-md transform -rotate-12" size={24} fill="currentColor" />
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-2xl font-black text-white tracking-tight drop-shadow-lg">Zen</span>
      <span className="text-sm font-bold text-indigo-300 tracking-widest uppercase">Finance</span>
    </div>
  </div>
);

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Credenciales incorrectas.');
      } else {
        setError('Error de autenticación. Verifica tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 z-0"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-8 w-full max-w-[420px] relative z-10 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900/60"
      >
        <div className="flex flex-col items-center mb-8">
          <ZenLogo size="large" />
          <motion.p 
            key={isLogin ? 'welcome' : 'join'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-400 mt-4 text-center text-sm font-medium"
          >
            {isLogin 
              ? 'Encuentra tu paz financiera hoy.' 
              : 'Comienza tu viaje hacia el control total.'}
          </motion.p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div className="space-y-4">
             <div className="relative group">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-transparent text-white font-medium peer"
                placeholder="Correo Electrónico"
              />
              <label className="absolute left-4 top-3.5 text-slate-500 text-sm transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-slate-900 peer-focus:px-1 peer-focus:text-indigo-400 peer-focus:font-bold peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-indigo-400 peer-[:not(:placeholder-shown)]:font-bold">
                Correo Electrónico
              </label>
            </div>
            
            <div className="relative group">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-transparent text-white font-medium peer"
                placeholder="Contraseña"
              />
               <label className="absolute left-4 top-3.5 text-slate-500 text-sm transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-slate-900 peer-focus:px-1 peer-focus:text-indigo-400 peer-focus:font-bold peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-indigo-400 peer-[:not(:placeholder-shown)]:font-bold">
                Contraseña
              </label>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl font-medium flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider font-bold">
            <span className="px-3 bg-slate-900 text-slate-500">O continúa con</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="relative z-10">Google</span>
        </button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors flex items-center justify-center gap-1 mx-auto group"
          >
            {isLogin ? (
              <>
                ¿No tienes cuenta? <span className="underline decoration-2 decoration-transparent group-hover:decoration-indigo-400 transition-all">Regístrate</span>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta? <span className="underline decoration-2 decoration-transparent group-hover:decoration-indigo-400 transition-all">Ingresa</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
