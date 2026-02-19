'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Note } from '@/lib/db/schema';
import html2pdf from 'html2pdf.js';

interface ExportButtonProps {
  note: Note | null;
}

type ExportFormat = 'pdf' | 'txt' | 'doc';

export function ExportButton({ note }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const exportAsTxt = useCallback(() => {
    if (!note) return;

    // Add BOM for proper UTF-8 encoding
    const content = '\uFEFF' + `${note.title}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  }, [note]);

  const exportAsDoc = useCallback(() => {
    if (!note) return;

    // Add BOM for proper UTF-8 encoding in Word
    const content = '\uFEFF' + `<html><meta charset="utf-8"><body>${note.title}<br/><br/>${note.content.replace(/\n/g, '<br/>')}</body></html>`;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  }, [note]);

  const exportAsPdf = useCallback(async () => {
    if (!note) return;

    setIsExporting(true);
    try {
      // Create HTML content for PDF
      const element = document.createElement('div');
      element.style.padding = '40px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.innerHTML = `
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333;">
          ${note.title || '无标题'}
        </h1>
        <div style="font-size: 14px; line-height: 1.8; color: #666; white-space: pre-wrap;">${note.content}</div>
      `;

      document.body.appendChild(element);

      // Generate PDF
      const opt = {
        margin: 10,
        filename: `${note.title || 'note'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      await html2pdf().set(opt).from(element).save();

      document.body.removeChild(element);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  }, [note]);

  const handleExport = useCallback((format: ExportFormat) => {
    switch (format) {
      case 'txt':
        exportAsTxt();
        break;
      case 'doc':
        exportAsDoc();
        break;
      case 'pdf':
        exportAsPdf();
        break;
    }
  }, [exportAsTxt, exportAsDoc, exportAsPdf]);

  if (!note) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 text-[var(--macos-text-primary)] hover:bg-[var(--macos-sidebar-hover)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={18} />
        <span>导出</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 py-2 bg-[var(--macos-bg)] border border-[var(--macos-border)] rounded-xl shadow-lg z-50 min-w-[150px]">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="w-full px-4 py-2 text-left text-[var(--macos-text-primary)] hover:bg-[var(--macos-sidebar-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <span className="font-medium">PDF</span>
            <span className="text-xs text-[var(--macos-text-secondary)]">.pdf</span>
          </button>
          <button
            onClick={() => handleExport('txt')}
            disabled={isExporting}
            className="w-full px-4 py-2 text-left text-[var(--macos-text-primary)] hover:bg-[var(--macos-sidebar-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <span className="font-medium">TXT</span>
            <span className="text-xs text-[var(--macos-text-secondary)]">.txt</span>
          </button>
          <button
            onClick={() => handleExport('doc')}
            disabled={isExporting}
            className="w-full px-4 py-2 text-left text-[var(--macos-text-primary)] hover:bg-[var(--macos-sidebar-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <span className="font-medium">DOC</span>
            <span className="text-xs text-[var(--macos-text-secondary)]">.doc</span>
          </button>
        </div>
      )}
    </div>
  );
}
