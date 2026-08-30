import { Component, ElementRef, inject, input, signal } from '@angular/core';
import { EXPORT_IGNORE_ATTR, WidgetExport } from './widget-export';

type ExportFormat = 'png' | 'svg';

/**
 * Small corner control that exports its containing card to a downloadable PNG or SVG image.
 *
 * Deliberately not a wrapper component around its target: it drops itself as the last element
 * inside the card it belongs to (a direct child, no extra container div) and exports
 * `elementRef.nativeElement.parentElement` — the card itself, background/border/padding and all.
 * This lets it attach to a component's own template (stat-tile) or be added purely from the
 * outside by wrapping an existing element in a plain `<div>` (the activity-heatmap card in
 * dashboard.html) without touching that component's internals.
 */
@Component({
  selector: 'app-export-controls',
  imports: [],
  templateUrl: './export-controls.html',
  styleUrl: './export-controls.scss',
  host: { class: 'export-controls', [EXPORT_IGNORE_ATTR]: '' },
})
export class ExportControls {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly widgetExport = inject(WidgetExport);

  /** Human-readable name for the card being exported — becomes the downloaded filename. */
  readonly filename = input.required<string>();

  protected readonly pending = signal<ExportFormat | null>(null);
  protected readonly failed = signal(false);

  protected export(format: ExportFormat): void {
    if (this.pending()) return;
    const card = this.elementRef.nativeElement.parentElement;
    if (!card) return;

    this.pending.set(format);
    this.failed.set(false);

    const options = { filename: this.filename() };
    const result = format === 'png' ? this.widgetExport.exportPng(card, options) : this.widgetExport.exportSvg(card, options);

    result.catch(() => this.failed.set(true)).finally(() => this.pending.set(null));
  }
}
