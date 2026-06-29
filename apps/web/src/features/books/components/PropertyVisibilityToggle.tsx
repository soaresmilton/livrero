import React, { useState, useRef, useEffect } from 'react';

export interface VisibleProperties {
  title: boolean;
  author: boolean;
  status: boolean;
  publisher: boolean;
  published_year: boolean;
  total_pages: boolean;
  cover: boolean;
  isbn: boolean;
  genres: boolean;
  rating: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const defaultVisibleProperties: VisibleProperties = {
  title: true,
  author: true,
  status: true,
  publisher: false,
  published_year: false,
  total_pages: false,
  cover: true,
  isbn: false,
  genres: true,
  rating: true,
};

interface PropertyVisibilityToggleProps {
  visibleProperties: VisibleProperties;
  onChange: (newProperties: VisibleProperties) => void;
}

export const PropertyVisibilityToggle: React.FC<PropertyVisibilityToggleProps> = ({
  visibleProperties,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProperty = (key: keyof VisibleProperties) => {
    onChange({
      ...visibleProperties,
      [key]: !visibleProperties[key],
    });
  };

  const propertiesList: { key: keyof VisibleProperties; label: string; icon: React.JSX.Element }[] = [
    { key: 'title', label: 'Título do Livro', icon: <path d="M5 4v16l7-4 7 4V4a1 1 0 00-1-1H6a1 1 0 00-1 1z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'author', label: 'Autor', icon: <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'status', label: 'Status', icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'publisher', label: 'Editora', icon: <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'published_year', label: 'Ano de Publicação', icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'total_pages', label: 'Total de Páginas', icon: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'isbn', label: 'ISBN', icon: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'cover', label: 'Capa', icon: <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'genres', label: 'Gêneros', icon: <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round" /> },
    { key: 'rating', label: 'Avaliação', icon: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" /> },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] transition-colors flex items-center justify-center border border-transparent hover:border-[var(--color-outline-variant)] cursor-pointer"
        title="Configurar Galeria"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-outline-variant)]">
            <h4 className="text-sm font-semibold text-[var(--color-on-surface)]">Visibilidade</h4>
          </div>
          <div className="py-2 max-h-60 overflow-y-auto">
            {propertiesList.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => toggleProperty(key)}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-[var(--color-surface-container)] transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-sm text-[var(--color-on-surface)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-on-surface-variant)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {icon}
                  </svg>
                  {label}
                </div>
                <div className="text-[var(--color-on-surface-variant)]">
                  {visibleProperties[key] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
