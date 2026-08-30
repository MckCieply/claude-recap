import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Landing } from './landing';
import type { ImportBatchResult } from './landing';

const validConversation = {
  uuid: 'conv-1',
  name: 'Test',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  chat_messages: [],
};

function jsonFile(name: string, content: unknown): File {
  return new File([JSON.stringify(content)], name, { type: 'application/json' });
}

interface FileRowView {
  name: string;
  label: string;
  status: 'reading' | 'success' | 'error';
  message?: string;
}

/**
 * Exercises the file-processing pipeline and row state directly rather than through
 * simulated drag/drop or file-input DOM events — jsdom's DataTransfer/file-input
 * emulation is unreliable, and `processFiles` (private) is where the real logic lives;
 * `onDrop`/`onFileInputChange` are thin adapters that just extract a `File[]` from the
 * DOM event and hand it off.
 */
interface LandingTestAccess {
  processFiles(files: File[]): Promise<void>;
  rows: () => FileRowView[];
}

function access(component: Landing): LandingTestAccess {
  return component as unknown as LandingTestAccess;
}

describe('Landing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Landing] }).compileComponents();
  });

  it('renders the privacy promise and a dropzone', () => {
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toMatch(/never uploaded/i);
    expect(text).toMatch(/drop your conversations\.json here/i);
  });

  it('accepts a valid export file and emits it as a labeled export', async () => {
    const fixture = TestBed.createComponent(Landing);
    const component = fixture.componentInstance;
    let emitted: ImportBatchResult | undefined;
    component.imported.subscribe((event) => (emitted = event));

    await access(component).processFiles([jsonFile('personal-export.json', [validConversation])]);

    const rows = access(component).rows();
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('success');
    expect(emitted?.accepted).toHaveLength(1);
    expect(emitted?.accepted[0].label).toBe('personal-export');
    expect(emitted?.failed).toHaveLength(0);
  });

  it('surfaces the validation message next to a file that fails to parse, without emitting', async () => {
    const fixture = TestBed.createComponent(Landing);
    const component = fixture.componentInstance;
    let emitted = false;
    component.imported.subscribe(() => (emitted = true));

    await access(component).processFiles([jsonFile('not-an-export.json', { unexpected: 'shape' })]);

    const rows = access(component).rows();
    expect(rows[0].status).toBe('error');
    expect(rows[0].message).toMatch(/conversations\.json/i);
    expect(emitted).toBe(false);
  });

  it('rejects non-JSON files without attempting to parse them', async () => {
    const fixture = TestBed.createComponent(Landing);
    const component = fixture.componentInstance;

    await access(component).processFiles([new File(['not json'], 'notes.txt', { type: 'text/plain' })]);

    const rows = access(component).rows();
    expect(rows[0].status).toBe('error');
    expect(rows[0].message).toMatch(/\.json/i);
  });

  it('reports a mix of accepted and failed files from the same batch', async () => {
    const fixture = TestBed.createComponent(Landing);
    const component = fixture.componentInstance;
    let emitted: ImportBatchResult | undefined;
    component.imported.subscribe((event) => (emitted = event));

    await access(component).processFiles([
      jsonFile('good-export.json', [validConversation]),
      jsonFile('bad-export.json', { nope: true }),
    ]);

    expect(emitted?.accepted).toHaveLength(1);
    expect(emitted?.failed).toHaveLength(1);
    expect(emitted?.failed[0].name).toBe('bad-export.json');
  });
});
