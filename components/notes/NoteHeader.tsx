'use client';

import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Note } from '@/lib/db/schema';

interface NoteHeaderProps {
  note: Note;
  onDelete: () => void;
  onBack?: () => void;
}

export function NoteHeader({ note, onDelete, onBack }: NoteHeaderProps) {
  const formattedDate = format(new Date(note.updatedAt), 'yyyy年MM月dd日 HH:mm', {
    locale: zhCN
  });

  return (
    <div className="px-6 py-4 border-b border-[var(--macos-divider)] flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1 rounded hover:bg-[var(--macos-sidebar-hover)]"
          >
            <ArrowLeft size={20} className="text-[var(--macos-text-secondary)]" />
          </button>
        )}
        <span className="text-xs text-[var(--macos-text-secondary)]">{formattedDate}</span>
      </div>
      <button
        onClick={onDelete}
        className="p-2 rounded hover:bg-red-50 hover:text-red-600
          dark:hover:bg-red-900/20 transition-colors"
        title="删除备忘录"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
