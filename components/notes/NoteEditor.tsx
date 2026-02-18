'use client';

import { useState, useEffect, useRef } from 'react';
import { Note } from '@/lib/db/schema';
import { NoteHeader } from './NoteHeader';

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: number, data: { title?: string; content?: string }) => void;
  onDelete: (id: number) => void;
  onBack?: () => void;
}

export function NoteEditor({ note, onUpdate, onDelete, onBack }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  // Debounced auto-save
  const handleChange = (field: 'title' | 'content', value: string) => {
    if (field === 'title') {
      setTitle(value);
    } else {
      setContent(value);
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      onUpdate(note.id, { [field]: value });
    }, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDelete = () => {
    if (confirm('确定要删除这个备忘录吗？')) {
      onDelete(note.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--macos-bg)] overflow-hidden">
      <NoteHeader note={note} onDelete={handleDelete} onBack={onBack} />

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="无标题"
        className="text-2xl font-semibold px-6 py-4 bg-transparent border-none outline-none
          text-[var(--macos-text-primary)] placeholder:text-[var(--macos-text-secondary)]"
      />

      {/* Content Textarea */}
      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => handleChange('content', e.target.value)}
        placeholder="开始输入..."
        className="flex-1 px-6 pb-6 bg-transparent border-none outline-none resize-none
          text-[var(--macos-text-primary)] placeholder:text-[var(--macos-text-secondary)]
          leading-relaxed min-h-[300px]"
      />
    </div>
  );
}
