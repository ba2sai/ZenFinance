import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { User, Mail, Edit2, LogOut, Check, X, Shield, Globe, Monitor, Calendar, Award, Flame, FolderPlus, Plus, Loader2, TrendingUp, CreditCard, Trash2 } from 'lucide-react';
import { updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { GoogleCalendarService } from '../services/GoogleCalendarService';
import { useGamification } from '../hooks/useGamification';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileView: React.FC = () => {
  const { user, logout, googleAccessToken, orgId } = useAuthStore();
  const { clearFinanceData, incomes, recurringExpenses, savingsGoals, addSavingGoal, removeSavingGoal, language, currency, setLanguage, setCurrency, expenses, customCategories, addCustomCategory, removeCustomCategory } = useFinanceStore();
  const { currentBelt, badges, streak } = useGamification();
  
  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Categories Manager
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [catLoading, setCatLoading] = useState(false);

  const handleAddCategory = async () => {
     if (!newCatName.trim() || !orgId) return;
     setCatLoading(true);
     try {
       await addCustomCategory({
         name: newCatName.trim(),
         type: newCatType,
         organizationId: orgId
       });
       setNewCatName('');
     } catch (err) {
       console.error(err);
     } finally {
       setCatLoading(false);
     }
  };

  const handleRemoveCategory = async (id: string) => {
     if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
     try {
       await removeCustomCategory(id);
     } catch (err) {
       console.error(err);
     }
  };  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
     setToastMsg(msg);
     setTimeout(() => setToastMsg(null), 3000);
  };

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

  const handleSyncCalendar = async () => {
      if (!googleAccessToken) return;
      setSyncing(true);
      setSyncMessage('Sincronizando...');
      try {
          const service = new GoogleCalendarService(googleAccessToken);
          await service.syncFinancials(incomes, recurringExpenses);
          setSyncMessage('¡Sincronización exitosa!');
          setTimeout(() => setSyncMessage(''), 3000);
      } catch (error) {
          console.error("Error sincronizando:", error);
          setSyncMessage('Hubo un error al sincronizar.');
      } finally {
          setSyncing(false);
      }
  };

  const handleConnectCalendar = async () => {
      setSyncing(true);
      setSyncMessage('');
      try {
          const provider = new GoogleAuthProvider();
          provider.addScope('https://www.googleapis.com/auth/calendar.events');
          const result = await signInWithPopup(auth, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
              useAuthStore.getState().setGoogleAccessToken(credential.accessToken);
              setSyncMessage('¡Calendario conectado!');
              setTimeout(() => setSyncMessage(''), 3000);
          }
      } catch (error) {
          console.error("Error conectando calendario:", error);
          setSyncMessage('Error al conectar Google Calendar.');
          setTimeout(() => setSyncMessage(''), 3000);
      } finally {
          setSyncing(false);
      }
  };

  const annualSavingsPlan = savingsGoals?.find(g => g.name === 'Plan de Ahorro Anual');
  const isAnnualPlanEnabled = !!annualSavingsPlan;

  const handleToggleAnnualPlan = async () => {
    if (!orgId) return;
    try {
       if (isAnnualPlanEnabled && annualSavingsPlan) {
         await removeSavingGoal(annualSavingsPlan.id);
       } else {
         await addSavingGoal({
           name: 'Plan de Ahorro Anual',
           target: 10000, 
           current: 0,
           icon: '🎯',
           organizationId: orgId
         });
       }
    } catch (error) {
       console.error("Error toggling annual plan:", error);
       alert("Hubo un error al activar/desactivar el plan. Si los errores persisten, por favor recarga la página (F5).");
    }
  };

  const handleDownloadICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ZenFinance//ES\n";
    
    const formatDate = (dateValue: string) => {
        const d = new Date(dateValue);
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const addEvent = (title: string, date: string, amount: number, isIncome: boolean, rrule?: string) => {
        const uid = Math.random().toString(36).substring(2) + "@zenfinance.app";
        const prefix = isIncome ? '🟢 Ingreso' : '🔴 Gasto';
        const start = formatDate(date);
        let event = `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${start}\nDTSTART;VALUE=DATE:${start.substring(0,8)}\nSUMMARY:${prefix}: ${title} ($${amount})\n`;
        if (rrule) event += `RRULE:${rrule}\n`;
        event += "END:VEVENT\n";
        icsContent += event;
    };

    incomes.forEach(inc => {
        if (inc.frequency === 'one-time' && inc.date) {
            addEvent(inc.source, inc.date, inc.amount, true);
        } else if (inc.recurrenceDays && inc.recurrenceDays.length > 0) {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), inc.recurrenceDays[0]).toISOString();
            const rrule = `FREQ=MONTHLY;BYMONTHDAY=${inc.recurrenceDays.join(',')}`;
            addEvent(inc.source, startDate, inc.amount, true, rrule);
        }
    });

    expenses.forEach(exp => {
        if (exp.frequency === 'one-time' && exp.date) {
            addEvent(exp.description, exp.date, exp.amount, false);
        } else if (exp.frequency === 'weekly') {
            const today = new Date().toISOString();
            addEvent(exp.description, today, exp.amount, false, 'FREQ=WEEKLY');
        } else if (exp.frequency === 'monthly' && exp.recurrenceDays && exp.recurrenceDays.length > 0) {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), exp.recurrenceDays[0]).toISOString();
            const rrule = `FREQ=MONTHLY;BYMONTHDAY=${exp.recurrenceDays.join(',')}`;
            addEvent(exp.description, startDate, exp.amount, false, rrule);
        }
    });

    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ZenFinance_Calendario.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 relative">
      <AnimatePresence>
         {toastMsg && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2"
            >
               <Check size={18} />
               {toastMsg}
            </motion.div>
         )}
      </AnimatePresence>

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

         {/* Gamification Card */}
         <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Award className="text-amber-400" />
                  Logros Zen
               </h3>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 font-bold text-sm">
                  <Flame size={16} /> {streak} Días de Racha
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* Belt Card */}
               <div className={`col-span-1 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border border-white/5 ${currentBelt.color}`}>
                  <span className="text-4xl">🥋</span>
                  <span className="font-black text-lg">{currentBelt.name}</span>
                  <p className="text-xs opacity-80">Nivel Actual</p>
               </div>

               {/* Badges */}
               <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {badges.map(badge => (
                     <div key={badge.id} className={`p-4 rounded-2xl border ${badge.unlocked ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900/50 border-slate-800 opacity-50'} flex flex-col items-center text-center relative overflow-hidden`}>
                        <span className="text-3xl mb-2">{badge.icon}</span>
                        <h4 className={`font-bold mb-1 ${badge.unlocked ? 'text-indigo-400' : 'text-slate-500'}`}>{badge.name}</h4>
                        <p className="text-xs text-slate-400">{badge.description}</p>
                        
                        {!badge.unlocked && badge.progress !== undefined && (
                           <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                              <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, badge.progress))}%` }} />
                           </div>
                        )}
                        
                        {badge.unlocked && (
                           <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-indigo-500 rounded-full text-white">
                              <Check size={12} strokeWidth={4} />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>

        {/* Settings Card */}
        <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-1 space-y-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Monitor size={20} className="text-purple-400" />
              Preferencias
           </h3>

           <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors group">
                 <div>
                    <p className="text-white font-medium">Idioma</p>
                    <p className="text-xs text-slate-500">Idioma de la aplicación</p>
                 </div>
                 <div className="flex items-center gap-2">
                     <select 
                       value={language}
                       onChange={(e) => {
                         setLanguage(e.target.value);
                         showToast("Idioma actualizado");
                       }}
                       className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none p-2 cursor-pointer w-full max-w-[140px]"
                     >
                       <option value="es">Español (ES)</option>
                       <option value="en">English (US)</option>
                     </select>
                  </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors group">
                 <div>
                    <p className="text-white font-medium">Moneda</p>
                    <p className="text-xs text-slate-500">Divisa principal</p>
                 </div>
                 <div className="flex items-center gap-2">
                     <select 
                       value={currency}
                       onChange={(e) => {
                         setCurrency(e.target.value);
                         showToast("Moneda actualizada");
                       }}
                       className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none p-2 cursor-pointer w-full max-w-[140px]"
                     >
                       <option value="USD">USD ($)</option>
                       <option value="EUR">EUR (€)</option>
                       <option value="COP">COP ($)</option>
                       <option value="MXN">MXN ($)</option>
                       <option value="ARS">ARS ($)</option>
                       <option value="CLP">CLP ($)</option>
                       <option value="PEN">PEN (S/)</option>
                     </select>
                  </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                 <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div>
                       <p className="text-white font-medium">Plan de Ahorro Anual</p>
                       <p className="text-xs text-slate-500">Activa un reto para ahorrar todo el año.</p>
                    </div>
                    <button 
                       onClick={handleToggleAnnualPlan}
                       className={`w-12 h-6 rounded-full flex items-center transition-colors p-1 ${isAnnualPlanEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
                    >
                       <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                 </div>
              </div>

               <div className="pt-4 border-t border-slate-800">
                 <button className="w-full py-2 text-sm text-slate-500 hover:text-rose-400 transition-colors">
                    Borrar todos mis datos
                 </button>
               </div>
            </div>
         </div>

        {/* Categories Card */}
        <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-2 space-y-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus size={20} className="text-pink-400" />
              Categorías Personalizadas
           </h3>

            <div className="space-y-4">
              <p className="text-sm text-slate-400">Agrega tus propias categorías para clasificar tus ingresos y gastos.</p>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full">
                 <select 
                   value={newCatType}
                   onChange={e => setNewCatType(e.target.value as 'income' | 'expense')}
                   className="shrink-0 bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none p-2"
                 >
                    <option value="expense">Gasto</option>
                    <option value="income">Ingreso</option>
                 </select>
                 
                 <input
                   type="text"
                   placeholder="Nombre..."
                   value={newCatName}
                   onChange={e => setNewCatName(e.target.value)}
                   className="flex-1 min-w-[120px] max-w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none p-2 px-3"
                 />
                 
                 <button
                   onClick={handleAddCategory}
                   disabled={catLoading || !newCatName.trim()}
                   className="shrink-0 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-12 h-10"
                 >
                   {catLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                 </button>
              </div>

              {customCategories.length > 0 && (
                 <div className="mt-4 space-y-2">
                    {customCategories.map(cat => (
                       <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {cat.type === 'income' ? <TrendingUp size={14} /> : <CreditCard size={14} />}
                             </div>
                             <span className="text-slate-300 font-medium">{cat.name}</span>
                          </div>
                          <button 
                             onClick={() => handleRemoveCategory(cat.id)}
                             className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* Integrations Card */}
        <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-2 space-y-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-emerald-400" />
              Integraciones
           </h3>

           <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                 <div>
                    <p className="text-white font-medium flex items-center gap-2">
                       Calendario Local (.ics)
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-2">Descarga un archivo compatible con Apple Calendar, Outlook y otros.</p>
                    <button 
                        onClick={handleDownloadICS}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2 border border-slate-700 hover:border-slate-600"
                    >
                        <Calendar size={16} />
                        Descargar .ics
                    </button>
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <p className="text-white font-medium flex items-center gap-2">
                       Google Calendar
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Sincronización en la nube directa con tu cuenta.</p>
                 </div>
                 
                 {googleAccessToken ? (
                     <button 
                        onClick={handleSyncCalendar}
                        disabled={syncing}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                     >
                        {syncing ? (
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                             <Calendar size={16} />
                        )}
                        {syncing ? 'Procesando...' : 'Sincronizar Eventos'}
                     </button>
                 ) : isGoogleUser ? (
                     <button 
                        onClick={handleConnectCalendar}
                        disabled={syncing}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                     >
                        {syncing ? (
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                             <Calendar size={16} />
                        )}
                        Conectar Calendario
                     </button>
                 ) : (
                     <p className="text-xs text-amber-400 bg-amber-400/10 p-2 rounded-lg border border-amber-400/20 text-center">
                         Inicia sesión con Google para usar esta función.
                     </p>
                 )}
                 {syncMessage && (
                     <p className={`text-xs text-center font-bold ${syncMessage.includes('error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                         {syncMessage}
                     </p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
