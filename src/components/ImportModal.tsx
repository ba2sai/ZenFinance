import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categorizeExpenses } from '../services/aiService';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Sparkles, X, FileText, Loader2, Upload } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const userId = user?.uid;
  const { setExpenses } = useFinanceStore();

  const handleImport = async (dataToProcess?: any[]) => {
    if ((!text && !dataToProcess) || !userId) return;
    setLoading(true);
    
    try {
      const result = dataToProcess || await categorizeExpenses(text);
      
      if (result) {
        const enrichedExpenses = result.map((e: any) => ({ ...e, userId: userId }));
        setExpenses(enrichedExpenses);
        onClose();
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const processFileFn = httpsCallable(functions, 'processUploadedFile');
        const response: any = await processFileFn({ 
          fileBase64: base64String, 
          mimeType: file.type 
        });
        
        if (response.data.status === 'success' && response.data.data) {
          handleImport(response.data.data.transactions);
        } else {
            console.error("OCR returned error:", response.data.metadata?.errorMsg);
        }
      } catch (error) {
        console.error("OCR Error:", error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-2xl p-8 relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Importar Datos Zen</h2>
                <p className="text-slate-500">Sube un archivo o pega el texto de tu estado de cuenta.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50 transition-all"
              >
                <Upload className="text-indigo-400" size={32} />
                <p className="text-indigo-600 font-bold">Subir PDF o Excel</p>
                <p className="text-xs text-indigo-400">Análisis OCR automático por Agente 6</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold">o pega texto</span>
                </div>
              </div>

              {loading ? (
                <div className="w-full space-y-4 animate-pulse">
                   <div className="h-6 bg-white/20 rounded-full w-1/3 mx-auto mb-6"></div>
                   <div className="h-12 bg-white/20 rounded-xl w-full"></div>
                   <div className="h-12 bg-white/20 rounded-xl w-full"></div>
                   <div className="h-12 bg-white/20 rounded-xl w-full opacity-70"></div>
                   <p className="text-center text-xs text-indigo-300 font-bold mt-4">Analizando tus transacciones fiscales, por favor espera...</p>
                </div>
              ) : (
                <textarea
                  className="w-full h-32 bg-white/30 border border-white/50 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                  placeholder="Ejemplo: 2024-05-10 Restaurante El Sol $45.00..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              )}
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleImport()}
                disabled={loading || (!text && !loading)}
                className="bg-linear-to-r from-indigo-500 to-purple-500 text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loading ? 'Analizando...' : 'Empezar Análisis'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
