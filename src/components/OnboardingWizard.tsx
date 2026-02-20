import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, DollarSign, Calendar, Check, Wallet, Home, Car, Smartphone, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SUGGESTED_EXPENSES = [
  { id: 'rent', name: 'Alquiler / Hipoteca', icon: Home, category: 'Survival' },
  { id: 'car', name: 'Préstamo de Auto', icon: Car, category: 'Survival' },
  { id: 'services', name: 'Servicios (Luz, Agua)', icon: Zap, category: 'Survival' },
  { id: 'streaming', name: 'Streaming (Netflix, etc)', icon: Smartphone, category: 'Lujo' },
  { id: 'insurance', name: 'Seguros', icon: Check, category: 'Inversión' },
  { id: 'personal', name: 'Préstamos Personales', icon: Wallet, category: 'Survival' },
];

export const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [income, setIncomeValue] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly'>('monthly');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [dueDates, setDueDates] = useState<Record<string, number>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const { setOnboardingComplete } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showFixButton, setShowFixButton] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleNext = async () => {
    if (step === 3) {
      setIsLoading(true);
      try {
        // 1. Force token refresh to ensure custom claims (orgId) are present
        const { auth } = await import('../firebase');
        if (auth.currentUser) {
           await auth.currentUser.getIdToken(true);
        }
        
        // 2. Get the latest orgId from the store (it should update after refresh if we were listening, but let's be safe)
        const token = await auth.currentUser?.getIdTokenResult();
        const currentOrgId = (token?.claims.orgId as string) || 'default-org';

        const incomeValue = parseFloat(income);
        if (!isNaN(incomeValue)) {
          console.log("Saving income...", { currentOrgId });
          await addDoc(collection(db, 'incomes'), {
            source: 'Ingreso Principal',
            amount: incomeValue,
            frequency,
            organizationId: currentOrgId,
            timestamp: serverTimestamp()
          });
        }

        for (const id of selectedExpenses) {
          const suggested = SUGGESTED_EXPENSES.find(s => s.id === id);
          if (suggested) {
             console.log("Saving expense:", suggested.name);
            await addDoc(collection(db, 'recurring_expenses'), {
              name: suggested.name,
              amount: parseFloat(amounts[id] || '0'),
              dueDate: dueDates[id] || 1,
              category: suggested.category,
              organizationId: currentOrgId,
              timestamp: serverTimestamp()
            });
          }
        }

        console.log("Onboarding data saved successfully.");
        setOnboardingComplete(true);
      } catch (error: any) {
        console.error("Error saving onboarding data:", error);
        if (error.message?.includes("Missing or insufficient permissions") || error.code === "permission-denied") {
          setShowFixButton(true);
          alert("Error de permisos detectado. Por favor, haz clic en el botón 'Reparar Cuenta' que aparecerá abajo.");
        } else {
          alert(`Error al guardar: ${error.message || 'Error desconocido'}. Revisa la consola.`);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleFixAccount = async () => {
    setIsFixing(true);
    try {
      const { functions, auth } = await import('../firebase');
      const { httpsCallable } = await import('firebase/functions');
      const setupOrg = httpsCallable(functions, 'setupOrganization');
      const result = await setupOrg();
      console.log("Organization setup result:", result.data);
      
      // Force token refresh
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        // Retry saving after a short delay to allow propagation
        setTimeout(() => {
          setShowFixButton(false);
          handleNext();
        }, 1000);
      }
    } catch (error) {
      console.error("Error fixing account:", error);
      alert("Error al reparar la cuenta. Por favor contacta soporte.");
    } finally {
      setIsFixing(false);
    }
  };

  const toggleExpense = (id: string) => {
    setSelectedExpenses(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl overflow-hidden relative bg-white/60"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-slate-800">Tu Flujo de Energía</h2>
                   <p className="text-slate-500">Para encontrar tu paz mental, primero entendamos tus ingresos.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                    <button 
                      onClick={() => setFrequency('monthly')}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${frequency === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                      Mensual
                    </button>
                    <button 
                      onClick={() => setFrequency('biweekly')}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${frequency === 'biweekly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                      Quincenal
                    </button>
                  </div>

                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                    <input 
                      type="number"
                      placeholder="Ingreso neto"
                      value={income}
                      onChange={(e) => setIncomeValue(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-slate-800">Compromisos Actuales</h2>
                   <p className="text-slate-500">Selecciona los gastos que ya forman parte de tu vida.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {SUGGESTED_EXPENSES.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => toggleExpense(exp.id)}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-left ${
                        selectedExpenses.includes(exp.id) 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20' 
                        : 'bg-white/50 border-slate-200 text-slate-600 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${selectedExpenses.includes(exp.id) ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        <exp.icon size={20} />
                      </div>
                      <span className="font-bold text-sm">{exp.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 h-[400px] overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-slate-800">Detalle Zen</h2>
                   <p className="text-slate-500">Ajusta los montos y fechas para que nada te tome por sorpresa.</p>
                </div>

                <div className="space-y-4">
                  {selectedExpenses.map((id) => {
                    const exp = SUGGESTED_EXPENSES.find(s => s.id === id);
                    if (!exp) return null;
                    return (
                      <div key={id} className="p-4 rounded-2xl bg-white/40 border border-slate-100 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <exp.icon size={18} className="text-indigo-500" />
                          <span className="font-bold text-slate-700">{exp.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="number"
                              placeholder="Monto"
                              value={amounts[id] || ''}
                              onChange={(e) => setAmounts({...amounts, [id]: e.target.value})}
                              className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                          </div>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="number"
                              min="1"
                              max="31"
                              placeholder="Día de pago (1-31)"
                              value={dueDates[id] || ''}
                              onChange={(e) => setDueDates({...dueDates, [id]: parseInt(e.target.value)})}
                              className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex justify-between items-center">
             <div className="flex gap-1 text-slate-300">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-indigo-500 w-6' : 'bg-slate-200'} transition-all`} />
                ))}
             </div>
             
             <div className="flex gap-3">
               {showFixButton && (
                 <button 
                   onClick={handleFixAccount}
                   disabled={isFixing}
                   className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 animate-pulse"
                 >
                   {isFixing ? 'Reparando...' : '⚠️ Reparar Cuenta'}
                 </button>
               )}
               <button 
                 onClick={handleNext}
                 disabled={isLoading || (step === 1 && !income) || (step === 2 && selectedExpenses.length === 0)}
                 className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 min-w-[180px] justify-center"
               >
                 {isLoading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Guardando...</span>
                   </>
                 ) : (
                   <>
                     {step === 3 ? 'Comenzar mi Viaje' : 'Siguiente'}
                     <ArrowRight size={20} />
                   </>
                 )}
               </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
