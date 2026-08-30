import { Component, input } from '@angular/core';
import { ExportControls } from '../../export/export-controls';

@Component({
  selector: 'app-stat-tile',
  imports: [ExportControls],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.scss',
  host: { class: 'stat-tile' },
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  /** Optional small line under the value — e.g. "312 messages" under a busiest-hour value. */
  readonly hint = input<string>();
}
