import { useState, useEffect } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import { useFinanceStore } from './store/useFinanceStore';
import { ImportModal } from './components/ImportModal';
import { WalkthroughModal } from './components/WalkthroughModal';
import { Sidebar } from './components/Sidebar';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Login } from './components/Login';
import { IncomeView } from './components/IncomeView';
import { ExpenseView } from './components/ExpenseView';
import { SavingsView } from './components/SavingsView';
import { SubscriptionAudit } from './components/SubscriptionAudit';
import { PeaceView } from './components/PeaceView';
import { Dashboard } from './components/Dashboard';
import { ProfileView } from './components/ProfileView';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { Toaster } from './components/stitch/Toast';

function App() {
  const auth = useAuthStore();
  const finance = useFinanceStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    if (auth.user?.uid) {
      const unsubs = finance.subscribeToFinancials(auth.user.uid);
      return () => unsubs.forEach(u => u());
    }
  }, [auth.user?.uid, finance.subscribeToFinancials]);

  if (auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!auth.user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen font-sans selection:bg-indigo-500/30 text-slate-100">
      <Toaster />
      <AnimatePresence>
        {!auth.isOnboardingComplete && <OnboardingWizard />}
        {isImportOpen && <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />}
      </AnimatePresence>

      <WalkthroughModal />

      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-20 lg:ml-64 transition-all duration-300 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black zen-gradient-text tracking-tight animate-in fade-in slide-in-from-left-4 duration-500">
              {activeView === 'dashboard' && `Hola, ${auth.user.email?.split('@')[0] || 'Zen Master'} 👋`}
              {activeView === 'incomes' && 'Mis Ingresos'}
              {activeView === 'expenses' && 'Mis Gastos'}
              {activeView === 'savings' && 'Metas de Ahorro'}
              {activeView === 'subs' && 'Auditoría de Suscripciones'}
              {activeView === 'peace' && 'Mi Paz Mental'}
              {activeView === 'scenario' && 'Simulador de Escenarios'}
              {activeView === 'profile' && 'Mi Perfil'}
            </h2>
            <p className="text-slate-400 font-medium mt-1">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex gap-3">
            {(activeView === 'incomes' || activeView === 'expenses') && (
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-5 py-2.5 bg-slate-800/50 backdrop-blur-md text-indigo-400 font-bold rounded-xl shadow-sm border border-white/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
              >
                <Upload size={18} />
                <span>Importar CSV</span>
              </button>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto pb-20">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'incomes' && <IncomeView />}
          {activeView === 'expenses' && <ExpenseView />}
          {activeView === 'savings' && <SavingsView />}
          {activeView === 'subs' && <SubscriptionAudit />}
          {activeView === 'peace' && <PeaceView />}
          {activeView === 'scenario' && <ScenarioSimulator />}
          {activeView === 'profile' && <ProfileView />}
        </div>
      </main>
    </div>
  );
}

export default App;
