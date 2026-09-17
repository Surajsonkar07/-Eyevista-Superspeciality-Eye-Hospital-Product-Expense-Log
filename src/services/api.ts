import { Sheet } from '../types';

const API_URL = '/api/sheets';

// Local storage backup keys
const STORAGE_KEY = 'eyevista_sheets_sync';

export async function fetchGlobalSheets(): Promise<Sheet[] | null> {
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Cache to localStorage for offline fallback
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.error(e);
        }
        return data;
      }
    }
  } catch (e) {
    console.warn('API unavailable, loading local fallback:', e);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('eyevista_sheets');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export async function saveGlobalSheets(sheets: Sheet[]): Promise<boolean> {
  // Always update local cache immediately
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    localStorage.setItem('eyevista_sheets', JSON.stringify(sheets));
  } catch (e) {
    console.error(e);
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheets),
    });
    return res.ok;
  } catch (e) {
    console.warn('API save failed, saved locally:', e);
    return false;
  }
}
