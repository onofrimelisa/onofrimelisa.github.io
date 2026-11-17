import { describe, it, expect, beforeEach } from 'vitest';
import { NoteService } from '../../src/services/note.service.js';
import { InMemoryNoteRepository } from '../helpers/mock.repository.js';
import { CreateNoteInput } from '../../src/models/note.model.js';

describe('NoteService', () => {
  let service: NoteService;
  let repo: InMemoryNoteRepository;

  const validInput: CreateNoteInput = {
    text: 'Test note',
    x: 100,
    y: 200,
    color: 'yellow',
    boardId: 'default',
    author: 'testuser',
  };

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
    service = new NoteService(repo);
  });

  describe('createNote', () => {
    it('creates a note with valid input', async () => {
      const note = await service.createNote(validInput);
      expect(note.id).toBeDefined();
      expect(note.text).toBe('Test note');
      expect(note.x).toBe(100);
      expect(note.y).toBe(200);
      expect(note.color).toBe('yellow');
      expect(note.boardId).toBe('default');
      expect(note.author).toBe('testuser');
      expect(note.createdAt).toBeInstanceOf(Date);
    });

    it('throws on empty text', async () => {
      await expect(service.createNote({ ...validInput, text: '' })).rejects.toThrow('empty');
    });

    it('throws on whitespace-only text', async () => {
      await expect(service.createNote({ ...validInput, text: '   ' })).rejects.toThrow('empty');
    });

    it('throws on text exceeding max length', async () => {
      const longText = 'a'.repeat(501);
      await expect(service.createNote({ ...validInput, text: longText })).rejects.toThrow('exceed');
    });
  });

  describe('updateNoteText', () => {
    it('updates text of existing note', async () => {
      const note = await service.createNote(validInput);
      const updated = await service.updateNoteText(note.id, 'Updated text');
      expect(updated?.text).toBe('Updated text');
    });

    it('returns null for non-existent note', async () => {
      const result = await service.updateNoteText('nonexistent', 'text');
      expect(result).toBeNull();
    });

    it('throws on empty text', async () => {
      const note = await service.createNote(validInput);
      await expect(service.updateNoteText(note.id, '')).rejects.toThrow('empty');
    });
  });

  describe('moveNote', () => {
    it('updates position of existing note', async () => {
      const note = await service.createNote(validInput);
      const moved = await service.moveNote(note.id, 500, 600);
      expect(moved?.x).toBe(500);
      expect(moved?.y).toBe(600);
    });

    it('returns null for non-existent note', async () => {
      const result = await service.moveNote('nonexistent', 100, 200);
      expect(result).toBeNull();
    });
  });

  describe('getBoardNotes', () => {
    it('returns notes for a specific board', async () => {
      await service.createNote(validInput);
      await service.createNote({ ...validInput, text: 'Second note' });
      await service.createNote({ ...validInput, boardId: 'other-board', text: 'Other board' });

      const notes = await service.getBoardNotes('default');
      expect(notes).toHaveLength(2);
    });

    it('returns empty array for board with no notes', async () => {
      const notes = await service.getBoardNotes('empty-board');
      expect(notes).toHaveLength(0);
    });
  });

  describe('importNotes', () => {
    it('imports valid notes', async () => {
      const imported = await service.importNotes(
        [
          { text: 'Note 1', x: 100, y: 100 },
          { text: 'Note 2', x: 200, y: 200, color: 'blue' },
        ],
        'default',
        'importer',
      );
      expect(imported).toHaveLength(2);
      expect(imported[0].author).toBe('importer');
      expect(imported[1].color).toBe('blue');
    });

    it('skips invalid notes', async () => {
      const imported = await service.importNotes(
        [
          { text: 'Valid', x: 100, y: 100 },
          { text: '', x: 200, y: 200 },
          { text: 'Missing coords', x: 'not a number' as any, y: 300 },
        ],
        'default',
        'importer',
      );
      expect(imported).toHaveLength(1);
      expect(imported[0].text).toBe('Valid');
    });

    it('defaults color to yellow for invalid color', async () => {
      const imported = await service.importNotes(
        [{ text: 'Note', x: 100, y: 100, color: 'invalid' }],
        'default',
        'importer',
      );
      expect(imported[0].color).toBe('yellow');
    });
  });
});
