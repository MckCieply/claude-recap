import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import type { ConversationsExport } from './data/claude-export.schema';

const sampleConversation: ConversationsExport[number] = {
  uuid: 'conv-1',
  name: 'Test conversation',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  chat_messages: [],
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows the landing screen before any file is imported', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-landing')).toBeTruthy();
    expect(compiled.querySelector('app-dashboard')).toBeFalsy();
  });

  it('switches to the dashboard once a file is accepted, and back on reset', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;

    app['onImported']({
      accepted: [{ label: 'personal-export', conversations: [sampleConversation] }],
      failed: [],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-dashboard')).toBeTruthy();
    expect(compiled.querySelector('app-landing')).toBeFalsy();

    const resetButton = compiled.querySelector<HTMLButtonElement>('.app__reset');
    expect(resetButton).toBeTruthy();
    resetButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-landing')).toBeTruthy();
    expect(compiled.querySelector('app-dashboard')).toBeFalsy();
  });

  it('keeps skipped-file details visible after switching to the dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;

    app['onImported']({
      accepted: [{ label: 'personal-export', conversations: [sampleConversation] }],
      failed: [{ name: 'broken.json', message: 'did not match the expected format' }],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toMatch(/broken\.json/);
    expect(text).toMatch(/did not match the expected format/);
  });
});
