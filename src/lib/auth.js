const STORAGE_KEY = 'share_auth';

export function getStoredAuth() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeAuth(username, password) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password }));
}

export function clearAuth() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function makeBasicHeader(username, password) {
  return 'Basic ' + btoa(username + ':' + password);
}
