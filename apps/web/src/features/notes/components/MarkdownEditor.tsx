import React from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escreva suas notas aqui...',
  readOnly = false,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="flex-1 w-full p-6 resize-none focus:outline-none font-sans leading-relaxed text-base bg-transparent"
        style={{
          minHeight: '400px',
          color: '#1a1714',
        }}
      />
    </div>
  );
};
