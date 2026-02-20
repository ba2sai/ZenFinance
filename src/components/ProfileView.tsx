import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { User, Mail, Edit2, LogOut, Check, X, Shield, Globe, Monitor } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export const ProfileView: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { clearFinanceData } = useFinanceStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL
      });
      // Force reload or update local store if needed
      window.location.reload(); 
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar perfil");
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
      await logout();
      clearFinanceData();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-white">Mi Perfil</h2>
          <p className="text-slate-400">Gestiona tu identidad y preferencias.</p>
        </div>
        <button 
           onClick={handleLogout}
           className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-500/20"
        >
           <LogOut size={18} /> Closing Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
           
           <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
              <div className="relative group">
                 <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-lg">
                    {photoURL ? (
                       <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <User size={40} className="text-slate-500" />
                    )}
                 </div>
                 {isEditing && (
                    <div className="absolute -bottom-2 -right-2 bg-slate-900 p-2 rounded-full border border-slate-700 shadow-xl">
                       <Edit2 size={14} className="text-slate-400" />
                    </div>
                 )}
              </div>

              <div className="flex-1 w-full space-y-4">
                 {isEditing ? (
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Nombre</label>
                          <input 
                             type="text" 
                             value={displayName}
                             onChange={(e) => setDisplayName(e.target.value)}
                             className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Foto URL</label>
                          <input 
                             type="text" 
                             value={photoURL}
                             onChange={(e) => setPhotoURL(e.target.value)}
                             placeholder="https://..."
                             className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                       </div>
                       <div className="flex gap-3 pt-2">
                          <button 
                             onClick={handleUpdateProfile}
                             disabled={loading}
                             className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl transition-colors flex justify-center items-center gap-2"
                          >
                             {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                             Guardar Cambios
                          </button>
                          <button 
                             onClick={() => setIsEditing(false)}
                             className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                          >
                             <X size={18} />
                          </button>
                       </div>
                    </div>
                 ) : (
                    <div>
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="text-2xl font-bold text-white mb-1">{user?.displayName || 'Usuario Zen'}</h3>
                              <div className="flex items-center gap-2 text-slate-400 text-sm">
                                 <Mail size={14} />
                                 {user?.email}
                              </div>
                           </div>
                           <button 
                              onClick={() => setIsEditing(true)}
                              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                           >
                              <Edit2 size={18} />
                           </button>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-3">
                           <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                              <Shield size={12} /> Cuenta Verificada
                           </div>
                           <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1.5">
                              <Globe size={12} /> Plan Gratuito
                           </div>
                        </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Settings Card */}
        <div className="glass-card p-8 rounded-3xl space-y-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Monitor size={20} className="text-purple-400" />
              Preferencias
           </h3>

           <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                 <div>
                    <p className="text-white font-medium">Tema</p>
                    <p className="text-xs text-slate-500">Apariencia de la app</p>
                 </div>
                 <span className="text-slate-400 text-sm group-hover:text-white transition-colors">Oscuro (Default)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                 <div>
                    <p className="text-white font-medium">Moneda</p>
                    <p className="text-xs text-slate-500">Divisa principal</p>
                 </div>
                 <span className="text-slate-400 text-sm group-hover:text-white transition-colors">USD ($)</span>
              </div>

              <div className="pt-4 border-t border-slate-800">
                 <button className="w-full py-2 text-sm text-slate-500 hover:text-rose-400 transition-colors">
                    Borrar todos mis datos
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
