import { useCallback, useEffect, useRef, useState } from 'react';
import type { StickyNote as StickyNoteType } from '../models/note.model';
import { MAX_NOTE_TEXT_LENGTH } from '../models/note.model';

const COLOR_MAP: Record<string, string> = {
  yellow: '#fff9c4',
  blue: '#bbdefb',
  green: '#c8e6c9',
  pink: '#f8bbd0',
  orange: '#ffe0b2',
};

interface StickyNoteProps {
  note: StickyNoteType;
  onMove: (id: string, x: number, y: number) => void;
  onUpdate: (id: string, text: string) => void;
}

export function StickyNote({ note, onMove, onUpdate }: StickyNoteProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync editText when note text changes externally
  useEffect(() => {
    if (!editing) {
      setEditText(note.text);
    }
  }, [note.text, editing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (editing) return;
      e.preventDefault();
      setDragging(true);
      dragOffset.current = {
        x: e.clientX - note.x,
        y: e.clientY - note.y,
      };
    },
    [editing, note.x, note.y],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, e.clientX - dragOffset.current.x);
      const newY = Math.max(0, e.clientY - dragOffset.current.y);
      onMove(note.id, newX, newY);
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, note.id, onMove]);

  const handleDoubleClick = () => {
    setEditing(true);
    setEditText(note.text);
  };

  const saveEdit = () => {
    setEditing(false);
    const trimmed = editText.trim();
    if (trimmed && trimmed !== note.text) {
      onUpdate(note.id, trimmed);
    } else {
      setEditText(note.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditText(note.text);
    }
  };

  const bgColor = COLOR_MAP[note.color] || COLOR_MAP.yellow;

  return (
    <div
      ref={noteRef}
      className={`sticky-note ${dragging ? 'dragging' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        backgroundColor: bgColor,
        transition: dragging ? 'none' : 'left 0.15s ease, top 0.15s ease',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          className="note-textarea"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          maxLength={MAX_NOTE_TEXT_LENGTH}
        />
      ) : (
        <div className="note-text">{note.text}</div>
      )}
      <div className="note-author">{note.author}</div>
    </div>
  );
}
