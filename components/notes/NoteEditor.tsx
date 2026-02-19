'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const currentNoteIdRef = useRef<number>(note.id);
  const lastSavedTitleRef = useRef<string>(note.title);
  const lastSavedContentRef = useRef<string>(note.content);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Only update local state when switching to a different note
  useEffect(() => {
    if (note.id !== currentNoteIdRef.current) {
      // Different note, update local state
      setTitle(note.title);
      setContent(note.content);
      currentNoteIdRef.current = note.id;
      lastSavedTitleRef.current = note.title;
      lastSavedContentRef.current = note.content;
    }
  }, [note.id]);

  // Silent save function - doesn't update UI
  const silentSave = useCallback((field: 'title' | 'content', value: string) => {
    // Only save if value changed from last saved
    const lastSaved = field === 'title' ? lastSavedTitleRef.current : lastSavedContentRef.current;
    if (value === lastSaved) return;

    // Update last saved ref
    if (field === 'title') {
      lastSavedTitleRef.current = value;
    } else {
      lastSavedContentRef.current = value;
    }

    // Silent save in background - don't update parent state
    onUpdate(note.id, { [field]: value });
  }, [note.id, onUpdate]);

  // Debounced auto-save (10 seconds)
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

    // Set new timeout for auto-save (10 seconds)
    timeoutRef.current = setTimeout(() => {
      silentSave(field, value);
    }, 10000);
  };

  // Manual save handler (Ctrl+S / Cmd+S)
  const handleManualSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    silentSave('title', title);
    silentSave('content', content);
  }, [title, content, silentSave]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleManualSave]);

  // Cleanup on unmount - save pending changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Save any pending changes on unmount
      if (title !== lastSavedTitleRef.current || content !== lastSavedContentRef.current) {
        if (title !== lastSavedTitleRef.current) {
          onUpdate(note.id, { title });
        }
        if (content !== lastSavedContentRef.current) {
          onUpdate(note.id, { content });
        }
      }
    };
  }, [note.id, title, content, onUpdate]);

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
