import { EventPlan } from '../types/event';
import { SAMPLE_EVENTS } from '../data/sampleEvents';

const STORAGE_KEY_EVENTS = 'festivo_ai_events_v1';
const STORAGE_KEY_ACTIVE_ID = 'festivo_ai_active_event_id_v1';

export function getStoredEvents(): EventPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      // Initialize with our 3 curated sample events
      saveEvents(SAMPLE_EVENTS);
      return SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_EVENTS;
  } catch (err) {
    console.error('Failed to load events from localStorage:', err);
    return SAMPLE_EVENTS;
  }
}

export function saveEvents(events: EventPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage:', err);
  }
}

export function getActiveEventId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (stored) return stored;
    return SAMPLE_EVENTS[0].id;
  } catch {
    return SAMPLE_EVENTS[0].id;
  }
}

export function setActiveEventId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Failed to save active event ID:', err);
  }
}

export function exportEventAsJSON(event: EventPlan): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(event, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const safeName = event.input.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  downloadAnchor.setAttribute('download', `festivo_plan_${safeName}_${event.input.date}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
