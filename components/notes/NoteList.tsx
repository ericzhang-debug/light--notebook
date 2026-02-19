'use client';

import { useState, useRef, TouchEvent } from 'react';
import { Note } from '@/lib/db/schema';
import { NoteListItem } from './NoteListItem';
import { Plus, RefreshCw } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: number | null;
  onSelectNote: (id: number) => void;
  onNewNote: () => void;
  onRefresh?: () => Promise<void>;
}

export function NoteList({ notes, selectedNoteId, onSelectNote, onNewNote, onRefresh }: NoteListProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list || !onRefresh) return;

    // Only trigger pull to refresh when at the top of the list
    if (list.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !onRefresh) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    // Only allow pulling down, not up
    if (distance > 0) {
      // Add resistance to the pull
      const resistance = 0.4;
      const newPullDistance = Math.min(distance * resistance, 80);
      setPullDistance(newPullDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging || !onRefresh) {
      setIsDragging(false);
      return;
    }

    setIsDragging(false);

    // Trigger refresh if pulled enough (60px threshold)
    if (pullDistance > 60 && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  const pullProgress = Math.min(pullDistance / 60, 1);
  const rotation = pullProgress * 360;

  return (
    <div className="w-full bg-[var(--macos-sidebar-bg)] border-r border-[var(--macos-border)] flex flex-col h-full relative">
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

      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-[var(--macos-sidebar-bg)] border-b border-[var(--macos-divider)] md:hidden"
          style={{
            height: `${Math.max(pullDistance, refreshing ? 60 : 0)}px`,
            opacity: pullProgress,
          }}
        >
          <RefreshCw
            size={24}
            className="text-[var(--macos-text-secondary)]"
            style={{
              transform: `rotate(${refreshing ? 360 : rotation}deg)`,
              transition: refreshing ? 'transform 1s linear' : 'none',
            }}
          />
        </div>
      )}

      {/* Notes list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
