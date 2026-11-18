import { StickyNote } from './note.model.js';

export interface ServerToClientEvents {
  'note:created': (note: StickyNote) => void;
  'note:updated': (data: { id: string; text: string; updatedAt: Date }) => void;
  'note:moved': (data: { id: string; x: number; y: number }) => void;
  'board:user-joined': (data: { username: string; users: string[] }) => void;
  'board:user-left': (data: { username: string; users: string[] }) => void;
  'board:notes-imported': (notes: StickyNote[]) => void;
}

export interface ClientToServerEvents {
  'board:join': (ack: (notes: StickyNote[]) => void) => void;
  'note:create': (data: { text: string; x: number; y: number; color: string }, ack: (note: StickyNote) => void) => void;
  'note:update': (data: { id: string; text: string }) => void;
  'note:move': (data: { id: string; x: number; y: number }) => void;
}

export interface SocketData {
  username: string;
}
