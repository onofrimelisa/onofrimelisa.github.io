import { useCallback, useEffect, useRef, useState } from 'react';
import type { StickyNote, NoteColor } from '../models/note.model';
import type { AppSocket } from './useSocket';

export function useBoard(socket: AppSocket | null) {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);
  const moveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!socket) return;

    socket.emit('board:join', (initialNotes) => {
      setNotes(initialNotes);
      setJoined(true);
    });

    socket.on('note:created', (note) => {
      setNotes((prev) => [...prev, note]);
    });

    socket.on('note:updated', (data) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === data.id ? { ...n, text: data.text, updatedAt: data.updatedAt } : n)),
      );
    });

    socket.on('note:moved', (data) => {
      setNotes((prev) => prev.map((n) => (n.id === data.id ? { ...n, x: data.x, y: data.y } : n)));
    });

    socket.on('board:user-joined', (data) => {
      setUsers(data.users);
    });

    socket.on('board:user-left', (data) => {
      setUsers(data.users);
    });

    socket.on('board:notes-imported', (importedNotes) => {
      setNotes((prev) => [...prev, ...importedNotes]);
    });

    return () => {
      socket.off('note:created');
      socket.off('note:updated');
      socket.off('note:moved');
      socket.off('board:user-joined');
      socket.off('board:user-left');
      socket.off('board:notes-imported');
      setJoined(false);
      setNotes([]);
      setUsers([]);
    };
  }, [socket]);

  const createNote = useCallback(
    (text: string, x: number, y: number, color: NoteColor) => {
      if (!socket) return;
      socket.emit('note:create', { text, x, y, color }, (note) => {
        setNotes((prev) => [...prev, note]);
      });
    },
    [socket],
  );

  const updateNote = useCallback(
    (id: string, text: string) => {
      if (!socket) return;
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text, updatedAt: new Date() } : n)));
      socket.emit('note:update', { id, text });
    },
    [socket],
  );

  const moveNote = useCallback(
    (id: string, x: number, y: number) => {
      if (!socket) return;
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
      const existing = moveTimers.current.get(id);
      if (existing) clearTimeout(existing);
      moveTimers.current.set(
        id,
        setTimeout(() => {
          socket.emit('note:move', { id, x, y });
          moveTimers.current.delete(id);
        }, 50),
      );
    },
    [socket],
  );

  return { notes, users, joined, createNote, updateNote, moveNote };
}
