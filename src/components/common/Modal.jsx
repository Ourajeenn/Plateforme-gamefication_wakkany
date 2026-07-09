import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-zinc-950 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-title" className="text-white font-heading font-bold italic text-2xl uppercase">{title}</h3>
          {onClose && (
            <button onClick={onClose} aria-label="Fermer la fenêtre" className="text-zinc-500 hover:text-white transition-colors">
              <iconify-icon icon="mdi:x" width="24"></iconify-icon>
            </button>
          )}
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

