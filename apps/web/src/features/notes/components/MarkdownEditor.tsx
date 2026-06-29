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
    <div className="flex-1 flex flex-col h-full bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="flex-1 w-full p-6 resize-none focus:outline-none text-livrero-secondary font-sans leading-relaxed text-base bg-transparent"
        style={{
          minHeight: '400px',
        }}
      />
    </div>
  );
};
