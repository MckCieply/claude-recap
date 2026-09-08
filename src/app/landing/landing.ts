import { Component, output, signal } from '@angular/core';
import { parseConversationsExport } from '../data/parse-export';
import type { LabeledExport } from '../data/multi-source-stats';

/** One dropped/selected file's journey through read -> parse -> accept-or-reject. */
interface FileRow {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  status: 'reading' | 'success' | 'error';
  message?: string;
}

/** A single drop/select action can yield a mix of good and bad files at once. */
export interface ImportBatchResult {
  accepted: LabeledExport[];
  failed: { name: string; message: string }[];
}

function stripJsonExtension(filename: string): string {
  return filename.replace(/\.json$/i, '');
}

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  host: { class: 'landing' },
})
export class Landing {
  /** Emitted once a drop/select batch finishes; only fires when at least one file parsed cleanly. */
  readonly imported = output<ImportBatchResult>();

  protected readonly rows = signal<FileRow[]>([]);
  protected readonly isDragging = signal(false);
  protected readonly isLoadingSample = signal(false);

  private nextId = 0;

  /**
   * Fetches the bundled synthetic demo dataset (same-origin static asset, never a network
   * call outside this app's own build) and runs it through the exact same read/parse/accept
   * pipeline as a dropped file, so a first-time visitor with no export of their own can still
   * see a full dashboard.
   */
  protected async loadSampleData(): Promise<void> {
    if (this.isLoadingSample()) return;
    this.isLoadingSample.set(true);
    try {
      const response = await fetch('sample-data/conversations.json');
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const text = await response.text();
      const file = new File([text], 'sample-conversations.json', { type: 'application/json' });
      await this.processFiles([file]);
    } catch {
      this.rows.set([
        {
          id: `row-${this.nextId++}`,
          name: 'sample-conversations.json',
          label: 'sample-conversations',
          status: 'error',
          message: "Couldn't load the sample data. Try again, or drop your own export instead.",
        },
      ]);
    } finally {
      this.isLoadingSample.set(false);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDragLeave(): void {
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      void this.processFiles(Array.from(files));
    }
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      void this.processFiles(Array.from(input.files));
    }
    // Reset so re-selecting the same filename after a fix still fires a change event.
    input.value = '';
  }

  private async processFiles(files: File[]): Promise<void> {
    const pairs = files.map((file) => ({
      file,
      row: {
        id: `row-${this.nextId++}`,
        name: file.name,
        label: stripJsonExtension(file.name),
        status: 'reading' as const,
        message: undefined as string | undefined,
      } satisfies FileRow,
    }));

    this.rows.set(pairs.map((pair) => pair.row));

    const accepted: LabeledExport[] = [];
    const failed: { name: string; message: string }[] = [];

    await Promise.all(
      pairs.map(async ({ file, row }) => {
        if (!file.name.toLowerCase().endsWith('.json')) {
          const message = 'Only .json files are supported.';
          this.updateRow(row.id, { status: 'error', message });
          failed.push({ name: row.name, message });
          return;
        }

        try {
          const text = await file.text();
          const data: unknown = JSON.parse(text);
          const result = parseConversationsExport(data);
          if (result.kind === 'success') {
            this.updateRow(row.id, { status: 'success' });
            accepted.push({ label: row.label, conversations: result.conversations });
          } else {
            this.updateRow(row.id, { status: 'error', message: result.message });
            failed.push({ name: row.name, message: result.message });
          }
        } catch {
          const message = "This file isn't valid JSON. Check that you selected the correct export file.";
          this.updateRow(row.id, { status: 'error', message });
          failed.push({ name: row.name, message });
        }
      }),
    );

    if (accepted.length > 0) {
      this.imported.emit({ accepted, failed });
    }
  }

  private updateRow(id: string, patch: Partial<FileRow>): void {
    this.rows.update((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }
}
