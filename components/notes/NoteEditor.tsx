'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from '@/lib/db/schema';
import { NoteHeader } from './NoteHeader';
import { Save } from 'lucide-react';

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: number, data: { title?: string; content?: string }) => Promise<void>;
  onDelete: (id: number) => void;
  onBack?: () => void;
}

export function NoteEditor({ note, onUpdate, onDelete, onBack }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const isNoteSwitchedRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Reset state when switching to different note
  useEffect(() => {
    if (isNoteSwitchedRef.current) {
      setTitle(note.title);
      setContent(note.content);
      setSaveStatus('idle');
      isNoteSwitchedRef.current = false;
    }
  }, [note.id, note.title, note.content]);

  // Mark that note will be switched
  useEffect(() => {
    return () => {
      isNoteSwitchedRef.current = true;
    };
  }, []);

  // Save function with status feedback, returns true if save was performed
  const performSave = useCallback(async (titleToSave: string, contentToSave: string, isManual: boolean): Promise<boolean> => {
    // Check if anything changed
    if (titleToSave === note.title && contentToSave === note.content) {
      return false;
    }

    setSaveStatus('saving');
    try {
      await onUpdate(note.id, {
        title: titleToSave,
        content: contentToSave,
      });
      setSaveStatus('saved');

      // Clear saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('idle');
      return false;
    }
  }, [note.id, note.title, note.content, onUpdate]);

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
      performSave(title, content, false);
    }, 10000);
  };

  // Manual save handler (Ctrl+S / Cmd+S)
  const handleManualSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    performSave(title, content, true);
  }, [title, content, performSave]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Back handler - saves first, then navigates back
  const handleBackWithSave = async () => {
    // Clear any pending auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Perform save and wait for it to complete
    const saved = await performSave(title, content, true);

    // Navigate back after save completes (or immediately if no changes)
    if (onBack) {
      if (saved) {
        // Wait a moment to show the save status
        setTimeout(() => {
          onBack();
        }, 500);
      } else {
        // No changes, go back immediately
        onBack();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--macos-bg)] overflow-hidden">
      {/* Save Status Banner */}
      {saveStatus !== 'idle' && (
        <div className={`px-4 py-2 text-center text-sm font-medium transition-all ${
          saveStatus === 'saving'
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {saveStatus === 'saving' ? '自动保存中...' : saveStatus === 'saved' ? '✓ 已保存' : ''}
        </div>
      )}

      <NoteHeader note={note} onDelete={handleDelete} onBack={handleBackWithSave} />

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

      {/* Mobile Save Button */}
      <button
        onClick={handleManualSave}
        disabled={saveStatus === 'saving'}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600
          text-white rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700
          transition-all duration-200 flex items-center justify-center
          disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        aria-label="保存"
      >
        <Save size={24} />
      </button>
    </div>
  );
}
