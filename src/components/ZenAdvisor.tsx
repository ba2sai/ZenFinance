import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, AlertCircle, Quote, CheckCircle2, ArrowRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

interface Advice {
  id: string;
  content: {
    message: string;
    alerts: string[];
    suggestions: string[];
  };
  rating: number | null;
}

interface ZenAdvisorProps {
  peaceFactor: number;
  savingsRate: number;
  hasEmergencyFund: boolean;
  compact?: boolean;
}

export const ZenAdvisor: React.FC<ZenAdvisorProps> = ({ peaceFactor, savingsRate, hasEmergencyFund, compact = false }) => {
  const { orgId: authOrgId } = useAuthStore();
  const orgId = authOrgId; // Alias for compatibility with existing code
  const { expenses, incomes } = useFinanceStore();
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    // Log metrics for debugging or future use in advice generation
    // console.log("Zen Metrics:", { peaceFactor, savingsRate, hasEmergencyFund });
  }, [peaceFactor, savingsRate, hasEmergencyFund]);

  useEffect(() => {
    if (!orgId) return;

    const q = query(collection(db, 'advice'), where('organizationId', '==', orgId), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setAdvice({ id: doc.id, ...doc.data() } as Advice);
      }
    });
    return () => unsubscribe();
  }, [orgId]);

  const { history, trends } = useHistoricalData(); // Initialize hook

  const handleRequestAdvice = async () => {
    setLoading(true);
    try {
      // 1. Generate Cash Flow Projection (Backend Analysis)

      const analyzeFn = httpsCallable(functions, 'analyzeFinancialFlow');
      
      const response: any = await analyzeFn({ 
        expenses, 
        income: incomes,
        history, 
        trends,
        context: {
          peaceFactor,
          savingsRate,
          hasEmergencyFund
        } 
      });
      
      if (response.data?.status === 'error') {
          throw new Error(response.data.metadata?.errorMsg || "Error from analyze module");
      }
      // The Cloud Function should create a new advice document, which this component will pick up via snapshot listener
    } catch (error) {
      console.error("Error requesting advice:", error);
      alert("Error generating advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (score: number) => {
    if (!advice) return;
    setRating(score);
    // In a real app, update the document in Firestore
  };

  if (compact) {
    return (
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden h-full flex flex-col justify-between group hover:bg-slate-800/80 transition-colors">
         <div className="absolute top-0 right-0 p-4 opacity-50">
            <Sparkles className="text-purple-400" size={24} />
         </div>
         
         <div>
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Zen Advisor</h4>
            <p className="text-sm text-slate-300 font-medium line-clamp-3">
               {advice ? advice.content.message : "Tu asesor financiero personal está listo para ayudarte."}
            </p>
         </div>

         <button 
           onClick={handleRequestAdvice}
           disabled={loading}
           className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-white transition-colors"
         >
            {loading ? 'Analizando...' : 'Ver consejos'} <ArrowRight size={14} />
         </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-yellow-400" />
              Zen Advisor
            </h3>
            <p className="text-slate-400">Inteligencia Artificial aplicada a tus finanzas.</p>
          </div>
          <button 
            onClick={handleRequestAdvice}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                 >
                    <Sparkles size={18} />
                 </motion.div>
                 Analizando...
              </>
            ) : (
              'Generar Nuevo Análisis'
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {advice ? (
            <motion.div 
              key={advice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6 relative">
                <Quote className="absolute top-4 left-4 text-purple-500/20" size={48} />
                <p className="text-lg text-slate-200 pl-12 italic leading-relaxed">
                  "{advice.content.message}"
                </p>
                
                {advice.content.alerts?.length > 0 && (
                  <div className="mt-6 space-y-3">
                     {advice.content.alerts.map((alert, i) => (
                       <div key={i} className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                          <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                          <p className="text-rose-200 text-sm">{alert}</p>
                       </div>
                     ))}
                  </div>
                )}
                 
                {advice.content.suggestions?.length > 0 && (
                   <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {advice.content.suggestions.map((sugg, i) => (
                         <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-emerald-200 text-sm">{sugg}</p>
                         </div>
                      ))}
                   </div>
                )}
              </div>

              {/* Feedback */}
              <div className="flex items-center gap-4 justify-end">
                <span className="text-sm text-slate-500">¿Fue útil este consejo?</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className={`p-1 transition-colors ${rating && rating >= star ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`}
                    >
                      <Star size={20} fill={rating && rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center border-2 border-dashed border-slate-700/50 rounded-3xl">
              <Sparkles className="mb-4 opacity-20" size={48} />
              <p className="max-w-md">
                Solicita un análisis para obtener recomendaciones personalizadas basadas en tus ingresos, gastos y metas.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

