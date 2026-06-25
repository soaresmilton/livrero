import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';

interface MarkAsReadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isUpdating?: boolean;
}

export const MarkAsReadModal: React.FC<MarkAsReadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isUpdating = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isUpdating ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-xl border border-[var(--color-outline-variant)]">
        <div className="p-6">
          <div className="mx-auto flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#1da073]/10 text-[#1da073] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-center text-[var(--color-primary)]">
            Marcar como Lido
          </h3>
          <p className="mt-2 text-sm text-center text-[var(--color-on-surface-variant)]">
            Tem certeza que deseja marcar o livro <strong className="text-[var(--color-on-surface)]">"{title}"</strong> como lido? Esta ação não poderá ser desfeita.
          </p>
        </div>
        
        <div className="bg-[var(--color-surface-container-low)] px-6 py-4 flex gap-3 justify-end border-t border-[var(--color-outline-variant)]">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex-1 sm:flex-none text-white border-transparent"
            style={{ backgroundColor: '#1da073' }}
          >
            {isUpdating ? 'Salvando...' : 'Marcar como Lido'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
