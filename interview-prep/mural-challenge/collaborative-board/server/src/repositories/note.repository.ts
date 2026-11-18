import { Collection, WithId, Document } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { StickyNote, CreateNoteInput } from '../models/note.model.js';

export interface INoteRepository {
  findByBoardId(boardId: string): Promise<StickyNote[]>;
  create(input: CreateNoteInput): Promise<StickyNote>;
  updateText(id: string, text: string): Promise<StickyNote | null>;
  updatePosition(id: string, x: number, y: number): Promise<StickyNote | null>;
  createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]>;
}

export class MongoNoteRepository implements INoteRepository {
  constructor(private collection: Collection) {}

  async findByBoardId(boardId: string): Promise<StickyNote[]> {
    const docs = await this.collection.find({ boardId }).toArray();
    return docs.map(this.toStickyNote);
  }

  async create(input: CreateNoteInput): Promise<StickyNote> {
    const now = new Date();
    const note: StickyNote = {
      id: uuidv4(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne({ ...note, _id: note.id as any });
    return note;
  }

  async updateText(id: string, text: string): Promise<StickyNote | null> {
    const result = await this.collection.findOneAndUpdate(
      { id },
      { $set: { text, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result ? this.toStickyNote(result) : null;
  }

  async updatePosition(id: string, x: number, y: number): Promise<StickyNote | null> {
    const result = await this.collection.findOneAndUpdate(
      { id },
      { $set: { x, y, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result ? this.toStickyNote(result) : null;
  }

  async createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]> {
    const now = new Date();
    const notes: StickyNote[] = inputs.map((input) => ({
      id: uuidv4(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }));
    if (notes.length > 0) {
      await this.collection.insertMany(notes.map((n) => ({ ...n, _id: n.id as any })));
    }
    return notes;
  }

  private toStickyNote(doc: WithId<Document>): StickyNote {
    return {
      id: doc.id as string,
      text: doc.text as string,
      x: doc.x as number,
      y: doc.y as number,
      author: doc.author as string,
      color: doc.color as any,
      boardId: doc.boardId as string,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    };
  }
}
