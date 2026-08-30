import { Component, computed, signal } from '@angular/core';
import { Dashboard } from './dashboard/dashboard';
import { Landing } from './landing/landing';
import type { ImportBatchResult } from './landing/landing';
import { computeMultiSourceStats } from './data/multi-source-stats';
import type { LabeledExport } from './data/multi-source-stats';

@Component({
  selector: 'app-root',
  imports: [Landing, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Every export accepted so far. Empty means "show the landing screen, nothing imported yet". */
  protected readonly exports = signal<LabeledExport[]>([]);

  /**
   * Files that failed validation on the most recent import batch, kept around after the
   * switch to the dashboard so a partial import (some files good, some bad) doesn't silently
   * lose the failure info the moment the landing screen unmounts. Cleared on reset.
   */
  protected readonly skippedFiles = signal<{ name: string; message: string }[]>([]);

  protected readonly hasData = computed(() => this.exports().length > 0);

  protected readonly multiSourceStats = computed(() => computeMultiSourceStats(this.exports()));

  protected onImported(result: ImportBatchResult): void {
    this.exports.update((current) => [...current, ...result.accepted]);
    this.skippedFiles.set(result.failed);
  }

  protected reset(): void {
    this.exports.set([]);
    this.skippedFiles.set([]);
  }
}
