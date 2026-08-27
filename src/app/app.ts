import { Component } from '@angular/core';
import { Dashboard } from './dashboard/dashboard';
import { sampleStats } from './data/sample-stats';

@Component({
  selector: 'app-root',
  imports: [Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly stats = sampleStats;
}
