import { Note } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface NoteListItemProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

export function NoteListItem({ note, isActive, onClick }: NoteListItemProps) {
  // Get preview of content (first 100 chars)
  const preview = note.content
    ? note.content.slice(0, 100).replace(/\n/g, ' ')
    : '无内容';

  // Format date
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: zhCN
  });

  return (
    <div
      onClick={onClick}
      className={`
        px-4 py-3 cursor-pointer border-b border-[var(--macos-divider)]
        transition-colors duration-150
        ${isActive
          ? 'bg-[var(--macos-sidebar-selected)] text-white'
          : 'hover:bg-[var(--macos-sidebar-hover)]'
        }
      `}
    >
      <h3 className="font-medium text-sm truncate mb-1">
        {note.title || '无标题'}
      </h3>
      <p className={`text-xs truncate mb-1 ${isActive ? 'text-white/80' : 'text-[var(--macos-text-secondary)]'}`}>
        {preview}
      </p>
      <p className={`text-xs ${isActive ? 'text-white/60' : 'text-[var(--macos-text-secondary)]'}`}>
        {timeAgo}
      </p>
    </div>
  );
}
