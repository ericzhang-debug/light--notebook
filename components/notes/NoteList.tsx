'use client';

import { Note } from '@/lib/db/schema';
import { NoteListItem } from './NoteListItem';
import { Plus } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: number | null;
  onSelectNote: (id: number) => void;
  onNewNote: () => void;
}

export function NoteList({ notes, selectedNoteId, onSelectNote, onNewNote }: NoteListProps) {
  return (
    <div className="w-full bg-[var(--macos-sidebar-bg)] border-r border-[var(--macos-border)] flex flex-col h-full">
      {/* Header with New Note button */}
      <div className="p-4 border-b border-[var(--macos-divider)]">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4
            bg-[var(--macos-sidebar-selected)] text-white rounded-lg
            hover:opacity-90 transition-opacity font-medium text-sm"
        >
          <Plus size={18} />
          新建备忘录
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-[var(--macos-text-secondary)]">
            <p className="text-sm">暂无备忘录</p>
            <p className="text-xs mt-1">点击上方按钮创建</p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={note.id === selectedNoteId}
              onClick={() => onSelectNote(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
