import { useCallback, useRef, useState } from 'react';
import type { NoteColor } from '../models/note.model';
import { NOTE_COLORS } from '../models/note.model';
import { importNotes } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useBoard } from '../hooks/useBoard';
import { StickyNote } from './StickyNote';
import { UserList } from './UserList';

const COLOR_MAP: Record<string, string> = {
  yellow: '#fff9c4',
  blue: '#bbdefb',
  green: '#c8e6c9',
  pink: '#f8bbd0',
  orange: '#ffe0b2',
};

interface BoardProps {
  token: string;
  username: string;
  onLogout: () => void;
}

export function Board({ token, username, onLogout }: BoardProps) {
  const { socket, connected } = useSocket(token);
  const { notes, users, joined, createNote, updateNote, moveNote } = useBoard(socket);
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBoardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only create note when clicking directly on the board background
      if (e.target !== e.currentTarget) return;
      createNote('New note', e.clientX, e.clientY, selectedColor);
    },
    [createNote, selectedColor],
  );

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setImportStatus('Importing...');
        const result = await importNotes(file, token);
        setImportStatus(`Imported ${result.imported} notes`);
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus(err instanceof Error ? err.message : 'Import failed');
        setTimeout(() => setImportStatus(null), 5000);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [token],
  );

  const cycleColor = () => {
    const idx = NOTE_COLORS.indexOf(selectedColor);
    setSelectedColor(NOTE_COLORS[(idx + 1) % NOTE_COLORS.length]);
  };

  return (
    <div className="board-container">
      <div className="toolbar">
        <div className="toolbar-left">
          <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className="toolbar-status">
            {connected ? (joined ? 'Connected' : 'Joining...') : 'Disconnected'}
          </span>
          <button
            type="button"
            className="color-btn"
            onClick={cycleColor}
            style={{ backgroundColor: COLOR_MAP[selectedColor] }}
            title={`Color: ${selectedColor}`}
          >
            {selectedColor}
          </button>
          <button type="button" className="toolbar-btn" onClick={() => fileInputRef.current?.click()}>
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          {importStatus && <span className="import-status">{importStatus}</span>}
        </div>
        <div className="toolbar-right">
          <UserList users={users} />
          <span className="toolbar-username">{username}</span>
          <button type="button" className="toolbar-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="board" onClick={handleBoardClick}>
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} onMove={moveNote} onUpdate={updateNote} />
        ))}
      </div>
    </div>
  );
}
