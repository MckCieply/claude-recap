import { Service } from '@angular/core';

/**
 * Longhand CSS properties copied from each element's computed style onto the export clone.
 *
 * Deliberately longhands only (never shorthands like `background`/`border`/`margin`) — shorthand
 * computed values aren't reliably re-parseable the same way across browsers when reapplied via
 * `style.setProperty`, longhands always are. Covers everything the dashboard's own stylesheets
 * actually use (flex/grid layout, box model, borders/radius, color, typography, outline) so the
 * cloned markup renders visually identical once serialized into a standalone SVG.
 */
const EXPORT_STYLE_PROPERTIES = [
  'display',
  'box-sizing',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'background-color',
  'background-image',
  'background-position',
  'background-size',
  'background-repeat',
  'color',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant-numeric',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-overflow',
  'white-space',
  'vertical-align',
  'overflow-x',
  'overflow-y',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'align-items',
  'align-content',
  'justify-content',
  'justify-items',
  'gap',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'grid-template-rows',
  'grid-auto-flow',
  'grid-column',
  'grid-row',
  'transform',
  'z-index',
  'outline-width',
  'outline-style',
  'outline-color',
  'outline-offset',
  'box-shadow',
] as const;

/** Elements carrying this attribute (e.g. the export button itself) are dropped from the exported image. */
export const EXPORT_IGNORE_ATTR = 'data-export-ignore';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

export interface WidgetExportOptions {
  /** Human-readable base name (no extension) — slugified into a safe filename. */
  filename: string;
}

function slugify(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'export';
}

/**
 * Serializes a DOM node to a standalone PNG or SVG image and triggers a client-side download.
 *
 * Native approach, no `html-to-image`/`html2canvas`: clone the node, inline its (and its
 * descendants') computed styles as explicit inline styles, wrap the clone in a `<foreignObject>`
 * inside a generated SVG document, then either offer that SVG directly as a download or draw it
 * into a `<canvas>` (via an `Image` loaded from a `data:image/svg+xml` URI) and export the canvas
 * as a PNG. Everything happens in-memory in the browser — nothing is uploaded anywhere.
 */
@Service()
export class WidgetExport {
  async exportPng(node: HTMLElement, options: WidgetExportOptions): Promise<void> {
    const { width, height } = this.measure(node);
    const svgUrl = await this.buildSvgDataUrl(node, width, height);

    const scale = 2; // export at 2x for a crisp, shareable image
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    const image = await this.loadImage(svgUrl);
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to encode PNG');
    this.downloadBlob(blob, `${slugify(options.filename)}.png`);
  }

  async exportSvg(node: HTMLElement, options: WidgetExportOptions): Promise<void> {
    const { width, height } = this.measure(node);
    const markup = this.buildSvgMarkup(node, width, height);
    const blob = new Blob([markup], { type: 'image/svg+xml' });
    this.downloadBlob(blob, `${slugify(options.filename)}.svg`);
  }

  private measure(node: HTMLElement): { width: number; height: number } {
    const rect = node.getBoundingClientRect();
    return { width: Math.max(1, Math.ceil(rect.width)), height: Math.max(1, Math.ceil(rect.height)) };
  }

  private buildSvgMarkup(node: HTMLElement, width: number, height: number): string {
    const background = getComputedStyle(node).backgroundColor;
    const clone = this.cloneWithComputedStyle(node);
    clone.querySelectorAll(`[${EXPORT_IGNORE_ATTR}]`).forEach((el) => el.remove());

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
      const backdrop = document.createElementNS(SVG_NS, 'rect');
      backdrop.setAttribute('width', String(width));
      backdrop.setAttribute('height', String(height));
      backdrop.setAttribute('fill', background);
      svg.appendChild(backdrop);
    }

    const foreignObject = document.createElementNS(SVG_NS, 'foreignObject');
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('width', String(width));
    foreignObject.setAttribute('height', String(height));

    // Explicit xmlns is required here: once this SVG is re-parsed standalone (as a data: URI
    // image, or as a downloaded .svg file), there's no surrounding HTML document to inherit
    // the XHTML namespace from.
    const container = document.createElementNS(XHTML_NS, 'div');
    container.setAttribute('xmlns', XHTML_NS);
    (container as unknown as HTMLElement).style.cssText = 'margin:0;display:block;';
    container.appendChild(clone);
    foreignObject.appendChild(container);
    svg.appendChild(foreignObject);

    return new XMLSerializer().serializeToString(svg);
  }

  private async buildSvgDataUrl(node: HTMLElement, width: number, height: number): Promise<string> {
    const markup = this.buildSvgMarkup(node, width, height);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  }

  private cloneWithComputedStyle(node: HTMLElement): HTMLElement {
    const clone = node.cloneNode(true) as HTMLElement;
    this.copyComputedStyle(node, clone);

    const sourceDescendants = node.querySelectorAll('*');
    const cloneDescendants = clone.querySelectorAll('*');
    sourceDescendants.forEach((sourceEl, i) => {
      const cloneEl = cloneDescendants[i];
      if (sourceEl instanceof HTMLElement && cloneEl instanceof HTMLElement) {
        this.copyComputedStyle(sourceEl, cloneEl);
      }
    });

    return clone;
  }

  private copyComputedStyle(source: Element, target: HTMLElement): void {
    const computed = getComputedStyle(source);
    for (const property of EXPORT_STYLE_PROPERTIES) {
      const value = computed.getPropertyValue(property);
      if (value) target.style.setProperty(property, value);
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to rasterize SVG'));
      image.src = url;
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
