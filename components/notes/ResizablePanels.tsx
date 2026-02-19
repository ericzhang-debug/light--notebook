'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizablePanelsProps {
  children: [ReactNode, ReactNode];
  defaultLeftWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function ResizablePanels({
  children,
  defaultLeftWidth = 320,
  minWidth = 200,
  maxWidth = 600,
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;
  }, [leftWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    setLeftWidth(newWidth);
  }, [isResizing, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full">
      {/* Left Panel */}
      <div style={{ width: leftWidth }} className="flex-shrink-0">
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className={`flex-shrink-0 w-1 bg-[var(--macos-divider)] hover:bg-[var(--macos-sidebar-selected)] cursor-col-resize transition-colors relative ${
          isResizing ? 'bg-[var(--macos-sidebar-selected)]' : ''
        }`}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-[var(--macos-text-secondary)]" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 min-w-0">
        {children[1]}
      </div>
    </div>
  );
}
