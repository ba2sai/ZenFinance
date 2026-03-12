import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
  title: string;
  description: string;
  formula?: string;
  example?: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ title, description, formula, example }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY - 8,   // 8px gap above button
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, []);

  const show = () => { updatePos(); setOpen(true); };
  const hide = () => setOpen(false);

  // Close on outside click / scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => hide();
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => open ? hide() : show()}
        className="ml-1.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none shrink-0"
        aria-label={`Ayuda: ${title}`}
      >
        <HelpCircle size={14} />
      </button>

      {open && createPortal(
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="w-64 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-4 text-left"
        >
          {/* Arrow  */}
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-r border-b border-white/10 rotate-45"
          />
          <p className="text-white font-bold text-sm mb-1">{title}</p>
          <p className="text-slate-300 text-xs leading-relaxed">{description}</p>

          {formula && (
            <div className="mt-2 px-2 py-1.5 bg-slate-900/60 rounded-lg border border-white/5">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">Fórmula</p>
              <p className="text-indigo-300 text-xs font-mono">{formula}</p>
            </div>
          )}

          {example && (
            <p className="mt-2 text-slate-400 text-[11px] leading-relaxed italic">{example}</p>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
