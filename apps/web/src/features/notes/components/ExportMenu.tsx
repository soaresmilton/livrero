import React from 'react';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface ExportMenuProps {
  title: string;
  markdownContent: string;
  elementIdToPrint: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ title, markdownContent, elementIdToPrint }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleExportMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    const sourceElement = document.getElementById(elementIdToPrint);
    if (!sourceElement) return;

    // Create a clone to render off-screen
    const clone = sourceElement.cloneNode(true) as HTMLElement;

    const opt = {
      margin: 10,
      filename: `${title.replace(/\s+/g, '_').toLowerCase()}_notas.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Pass the detached clone directly
    html2pdf().set(opt).from(clone).save().then(() => {
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-livrero-secondary hover:bg-livrero-surface transition-colors rounded cursor-pointer"
      >
        <Download size={16} />
        Exportar
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded shadow-sm z-10">
          <button
            onClick={handleExportMarkdown}
            className="w-full text-left px-4 py-2 text-sm text-livrero-secondary hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Como Markdown (.md)
          </button>
          <button
            onClick={handleExportPDF}
            className="w-full text-left px-4 py-2 text-sm text-livrero-secondary hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Como PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
};
