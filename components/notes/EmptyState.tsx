import { FileText } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--macos-bg)]">
      <div className="text-center text-[var(--macos-text-secondary)]">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">选择一个备忘录或创建新的</p>
      </div>
    </div>
  );
}
