import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface SessionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  initialNotes: string;
  onInsert: (notes: string) => void;
  onSave?: (notes: string) => void;
}

export const SessionNoteModal: React.FC<SessionNoteModalProps> = ({
  isOpen,
  onClose,
  date,
  initialNotes,
  onInsert,
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, isOpen]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28, 28, 25, 0.5)' }}
      onClick={onClose}
    >
      {/* Modal Panel */}
      <div
        className="relative flex flex-col w-full max-w-xl rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-outline-variant)',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-on-surface-variant)' }}>
              Nota da Sessão
            </p>
            <h2
              className="text-lg font-semibold mt-0.5"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--color-on-surface)' }}
            >
              {date}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors cursor-pointer"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body — editable textarea */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full resize-none focus:outline-none text-sm leading-relaxed rounded-lg p-3 border transition-colors"
            style={{
              fontFamily: 'Hanken Grotesk, sans-serif',
              color: 'var(--color-on-surface)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              minHeight: '240px',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-outline-variant)')}
            placeholder="Escreva sua nota aqui..."
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onInsert(notes);
              if (onSave) onSave(notes);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-container)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
          >
            <Plus size={16} />
            Inserir no texto
          </button>
        </div>
      </div>
    </div>
  );
};
