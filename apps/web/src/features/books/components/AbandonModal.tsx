import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';

interface AbandonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isUpdating?: boolean;
}

export const AbandonModal: React.FC<AbandonModalProps> = ({
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
            <svg className="h-8 w-8 text-[#BA1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-center text-[#6B7D6A]">
            Abandonar Leitura
          </h3>
          <p className="mt-2 text-sm text-center text-[var(--color-on-surface-variant)]">
            Tem certeza que deseja abandonar o livro <strong className="text-[var(--color-on-surface)]">"{title}"</strong>? 
          </p>
        </div>
        
        <div className="bg-[var(--color-surface-container-low)] px-6 py-4 flex gap-3 justify-end border-t border-[var(--color-outline-variant)]">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 sm:flex-none"
          >
            Voltar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex-1 sm:flex-none text-white border-transparent"
            style={{ backgroundColor: '#BA1A1A' }}
          >
            {isUpdating ? 'Abandonando...' : 'Sim, Abandonar'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
