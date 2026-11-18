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

export interface CreateNoteInput {
  text: string;
  x: number;
  y: number;
  color: NoteColor;
  boardId: string;
  author: string;
}

export interface UpdateNoteInput {
  text: string;
}

export interface MoveNoteInput {
  x: number;
  y: number;
}

export interface ImportNoteInput {
  text: string;
  x: number;
  y: number;
  color?: string;
  author?: string;
}

export const DEFAULT_BOARD_ID = 'default';
export const MAX_NOTE_TEXT_LENGTH = 500;
