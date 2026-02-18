'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/db/schema';
import { NoteList } from '@/components/notes/NoteList';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { EmptyState } from '@/components/notes/EmptyState';

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Fetch notes on mount
  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new note
  const handleNewNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
      });
      if (response.ok) {
        const newNote = await response.json();
        setNotes((prev) => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
        setMobileView('editor');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  // Update note
  const handleUpdateNote = async (id: number, data: { title?: string; content?: string }) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedNote = await response.json();
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? updatedNote : note))
        );
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // Delete note
  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== id));
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
          setMobileView('list');
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Select note
  const handleSelectNote = useCallback((id: number) => {
    setSelectedNoteId(id);
    setMobileView('editor');
  }, []);

  // Back to list (mobile)
  const handleBack = useCallback(() => {
    setMobileView('list');
  }, []);

  // Get selected note
  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;

  // Show loading or redirecting state
  if (!isLoaded || !userId) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--macos-text-secondary)]">
        加载中...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--macos-text-secondary)]">
        加载中...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top header bar with user button */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-[var(--macos-divider)] bg-[var(--macos-bg)]">
        <h1 className="text-lg font-semibold text-[var(--macos-text-primary)]"></h1>
        <UserButton />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar - always visible on desktop, conditionally on mobile */}
        <div className={`${mobileView === 'editor' ? 'hidden md:flex' : 'flex'} md:flex w-full md:w-80`}>
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
          />
        </div>

        {/* Editor - always visible on desktop, conditionally on mobile */}
        <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1`}>
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onBack={handleBack}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
