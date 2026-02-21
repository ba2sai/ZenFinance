import { LayoutDashboard, Wallet, PiggyBank, Receipt, DollarSign, LogOut, Menu, X, Sparkles, ShieldCheck, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { auth } from '../firebase';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incomes', label: 'Mis Ingresos', icon: DollarSign },
    { id: 'expenses', label: 'Mis Gastos', icon: Receipt },
    { id: 'savings', label: 'Metas de Ahorro', icon: PiggyBank },
    { id: 'subs', label: 'Suscripciones', icon: Wallet },
    { id: 'peace', label: 'Mi Paz Mental', icon: ShieldCheck },
    { id: 'scenario', label: 'Simulador', icon: Activity },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  const NavItem = ({ item, isMobile = false }: { item: typeof menuItems[0], isMobile?: boolean }) => {
    const isActive = activeView === item.id;
    return (
      <button
        onClick={() => {
          onViewChange(item.id);
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
          ${isActive 
            ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] border border-indigo-500/20' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }
        `}
      >
        <div className={`
          p-2 rounded-lg transition-colors
          ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-transparent group-hover:bg-white/5'}
        `}>
          <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''} />
        </div>
        <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
        
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute left-0 w-1 h-8 bg-indigo-400 rounded-r-full shadow-[0_0_10px_#818cf8]"
          />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white rounded-full shadow-2xl"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 h-[96vh] fixed left-4 top-[2vh] glass-panel rounded-3xl z-40 transition-all duration-300 border border-white/5 shadow-2xl">
        <div className="p-6 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
             <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white hidden lg:block">
            ZenFinance
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <div key={item.id} className="hidden lg:block">
               <NavItem item={item} />
            </div>
          ))}
          {/* Tablet Icon-Only View */}
          {menuItems.map((item) => (
             <button
               key={item.id}
               onClick={() => onViewChange(item.id)}
               className={`lg:hidden w-full p-3 rounded-xl flex justify-center mb-2 transition-colors relative group ${activeView === item.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
             >
               <div className={activeView === item.id ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}>
                  <item.icon size={24} />
               </div>
               {activeView === item.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-l-full shadow-[0_0_10px_#818cf8]" />}
             </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium hidden lg:block">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
             initial={{ opacity: 0, x: '100%' }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: '100%' }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-40 md:hidden flex flex-col p-6"
          >
             <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-black text-white">ZenFinance</h1>
             </div>
             
             <div className="space-y-2">
               {menuItems.map(item => (
                 <NavItem key={item.id} item={item} isMobile={true} />
               ))}
             </div>

             <button 
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 px-4 py-4 text-slate-400 hover:text-rose-400 rounded-xl"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
