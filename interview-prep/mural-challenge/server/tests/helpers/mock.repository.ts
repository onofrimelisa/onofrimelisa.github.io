import { v4 as uuidv4 } from 'uuid';
import { StickyNote, CreateNoteInput } from '../../src/models/note.model.js';
import { INoteRepository } from '../../src/repositories/note.repository.js';

export class InMemoryNoteRepository implements INoteRepository {
  private notes = new Map<string, StickyNote>();

  async findByBoardId(boardId: string): Promise<StickyNote[]> {
    return Array.from(this.notes.values()).filter((n) => n.boardId === boardId);
  }

  async create(input: CreateNoteInput): Promise<StickyNote> {
    const now = new Date();
    const note: StickyNote = {
      id: uuidv4(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(note.id, note);
    return note;
  }

  async updateText(id: string, text: string): Promise<StickyNote | null> {
    const note = this.notes.get(id);
    if (!note) return null;
    const updated = { ...note, text, updatedAt: new Date() };
    this.notes.set(id, updated);
    return updated;
  }

  async updatePosition(id: string, x: number, y: number): Promise<StickyNote | null> {
    const note = this.notes.get(id);
    if (!note) return null;
    const updated = { ...note, x, y, updatedAt: new Date() };
    this.notes.set(id, updated);
    return updated;
  }

  async createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]> {
    const notes: StickyNote[] = [];
    for (const input of inputs) {
      notes.push(await this.create(input));
    }
    return notes;
  }

  // Test helper
  clear() {
    this.notes.clear();
  }
}
