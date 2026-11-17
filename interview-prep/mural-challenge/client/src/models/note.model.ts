export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export const NOTE_COLORS: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'orange'];

export interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  author: string;
  color: NoteColor;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  'note:create': (
    data: { text: string; x: number; y: number; color: string },
    ack: (note: StickyNote) => void,
  ) => void;
  'note:update': (data: { id: string; text: string }) => void;
  'note:move': (data: { id: string; x: number; y: number }) => void;
}

export const DEFAULT_BOARD_ID = 'default';
export const MAX_NOTE_TEXT_LENGTH = 500;
