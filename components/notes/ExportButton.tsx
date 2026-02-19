'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Note } from '@/lib/db/schema';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';

Font.register({
  family: 'NotoSansSC',
  fonts: [
    {
      src: '/fonts/NotoSansSC-Regular.ttf',
    },
    {
      src: '/fonts/NotoSansSC-Bold.ttf',
      fontWeight: 'bold',
    }
  ]
});

interface ExportButtonProps {
  note: Note | null;
}

type ExportFormat = 'pdf' | 'txt' | 'doc';

// PDF Document Component
function PdfDocument({ note }: { note: Note }) {
  return (
    <Document>
      <Page size="A4" style={{ padding: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333',fontFamily: 'NotoSansSC' }}>
          {note.title || '无标题'}
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 1.8, color: '#666', fontFamily: 'NotoSansSC' }}>
          {note.content}
        </Text>
      </Page>
    </Document>
  );
}

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

    const content = `${note.title}\n\n${note.content}`;
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

    const content = `<html><meta charset="utf-8"><body>${note.title}<br/><br/>${note.content.replace(/\n/g, '<br/>')}</body></html>`;
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
      // Dynamic import to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(<PdfDocument note={note} />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title || 'note'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
