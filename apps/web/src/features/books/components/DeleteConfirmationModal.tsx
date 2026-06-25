import React from 'react';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-xl border border-[var(--color-outline-variant)]">
        <div className="p-6">
          <div className="mx-auto flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-[#BA1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-center text-[var(--color-primary)]">
            Excluir Livro
          </h3>
          <p className="mt-2 text-sm text-center text-[var(--color-on-surface-variant)]">
            Tem certeza que deseja excluir o livro <strong className="text-[var(--color-on-surface)]">"{title}"</strong> da sua biblioteca? Esta ação enviará o livro para a lixeira.
          </p>
        </div>
        
        <div className="bg-[var(--color-surface-container-low)] px-6 py-4 flex gap-3 justify-end border-t border-[var(--color-outline-variant)]">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 sm:flex-none text-white border-transparent"
            style={{ backgroundColor: '#BA1A1A' }}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Livro'}
          </Button>
        </div>
      </div>
    </div>
  );
};
