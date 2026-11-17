import { StickyNote, CreateNoteInput, ImportNoteInput, MAX_NOTE_TEXT_LENGTH, NoteColor, NOTE_COLORS } from '../models/note.model.js';
import { INoteRepository } from '../repositories/note.repository.js';

export class NoteService {
  constructor(private noteRepository: INoteRepository) {}

  async createNote(input: CreateNoteInput): Promise<StickyNote> {
    this.validateText(input.text);
    return this.noteRepository.create(input);
  }

  async updateNoteText(id: string, text: string): Promise<StickyNote | null> {
    this.validateText(text);
    return this.noteRepository.updateText(id, text);
  }

  async moveNote(id: string, x: number, y: number): Promise<StickyNote | null> {
    return this.noteRepository.updatePosition(id, x, y);
  }

  async getBoardNotes(boardId: string): Promise<StickyNote[]> {
    return this.noteRepository.findByBoardId(boardId);
  }

  async importNotes(notes: ImportNoteInput[], boardId: string, author: string): Promise<StickyNote[]> {
    const validInputs: CreateNoteInput[] = [];

    for (const note of notes) {
      if (!note.text || typeof note.text !== 'string') continue;
      if (note.text.length > MAX_NOTE_TEXT_LENGTH) continue;
      if (typeof note.x !== 'number' || typeof note.y !== 'number') continue;

      const color: NoteColor = (NOTE_COLORS as readonly string[]).includes(note.color || '')
        ? (note.color as NoteColor)
        : 'yellow';

      validInputs.push({
        text: note.text,
        x: note.x,
        y: note.y,
        color,
        boardId,
        author: note.author || author,
      });
    }

    if (validInputs.length === 0) return [];
    return this.noteRepository.createMany(validInputs);
  }

  private validateText(text: string): void {
    if (!text || !text.trim()) {
      throw new Error('Note text cannot be empty');
    }
    if (text.length > MAX_NOTE_TEXT_LENGTH) {
      throw new Error(`Note text cannot exceed ${MAX_NOTE_TEXT_LENGTH} characters`);
    }
  }
}
