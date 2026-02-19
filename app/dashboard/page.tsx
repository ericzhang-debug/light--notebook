'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/db/schema';
import { NoteList } from '@/components/notes/NoteList';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { EmptyState } from '@/components/notes/EmptyState';
import { ResizablePanels } from '@/components/notes/ResizablePanels';
import { ExportButton } from '@/components/notes/ExportButton';

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [editorKey, setEditorKey] = useState(0); // Force remount on note switch

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
        setEditorKey(prev => prev + 1); // Force remount
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  // Update note - silent save
  const handleUpdateNote = async (id: number, data: { title?: string; content?: string }) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // Silent save - update the specific note in list for display
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, ...data, updatedAt: new Date() }
            : note
        )
      );
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
    setEditorKey(prev => prev + 1); // Force remount editor when switching
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
      {/* Top header bar with user button and export */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-[var(--macos-divider)] bg-[var(--macos-bg)]">
        <h1 className="text-lg font-semibold text-[var(--macos-text-primary)]">备忘录</h1>
        <div className="flex items-center gap-3">
          <ExportButton note={selectedNote} />
          <UserButton />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1">
        {/* Desktop: Resizable panels */}
        <div className="hidden md:block h-full">
          <ResizablePanels defaultLeftWidth={320} minWidth={200} maxWidth={600}>
            <NoteList
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onNewNote={handleNewNote}
            />
            {selectedNote ? (
              <NoteEditor
                key={editorKey}
                note={selectedNote}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
              />
            ) : (
              <EmptyState />
            )}
          </ResizablePanels>
        </div>

        {/* Mobile: Toggle between list and editor */}
        <div className="md:hidden h-full flex flex-col">
          {mobileView === 'editor' ? (
            <div className="flex-1">
              {selectedNote ? (
                <NoteEditor
                  key={editorKey}
                  note={selectedNote}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                  onBack={handleBack}
                />
              ) : (
                <EmptyState />
              )}
            </div>
          ) : (
            <div className="flex-1">
              <NoteList
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelectNote={handleSelectNote}
                onNewNote={handleNewNote}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
