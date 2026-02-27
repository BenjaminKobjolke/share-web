import { API_BASE_URL } from '../config.js';
import { authStore } from '../stores/auth.js';
import { get } from 'svelte/store';

function getAuthHeader() {
  const auth = get(authStore);
  if (!auth || auth.anonymous) return {};
  return { Authorization: 'Basic ' + btoa(auth.username + ':' + auth.password) };
}

async function request(path, options = {}) {
  const url = API_BASE_URL + path;
  const headers = { ...getAuthHeader(), ...options.headers };
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    authStore.logout();
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }

  return res;
}

async function json(path, options = {}) {
  const res = await request(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || res.statusText);
  }
  return res.json();
}

export function getEntries(page = 1, perPage = 20) {
  return json(`/entries?page=${page}&per_page=${perPage}`);
}

export function getEntry(id) {
  return json(`/entries/${id}`);
}

export function getEntryFile(id) {
  return request(`/entries/${id}/file`);
}

export function getAttachmentFile(id) {
  return request(`/files/${id}`);
}

export function deleteEntry(id) {
  return json(`/entries/${id}`, { method: 'DELETE' });
}

export function updateEntry(id, data) {
  return json(`/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteAttachment(id) {
  return json(`/attachments/${id}`, { method: 'DELETE' });
}

export function uploadText(payload) {
  // share.php is at the API root level, not under /api
  const shareUrl = API_BASE_URL.replace(/\/api\/?$/, '') + '/share.php';
  return fetch(shareUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.text();
  });
}

export function uploadFile(file, extraFields = {}) {
  const shareUrl = API_BASE_URL.replace(/\/api\/?$/, '') + '/share.php';
  const formData = new FormData();
  formData.append('file', file);
  for (const [key, value] of Object.entries(extraFields)) {
    formData.append(key, value);
  }
  return fetch(shareUrl, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.text();
  });
}

export function getFields() {
  return json('/fields');
}

export function testAuth() {
  return json('/fields');
}

export async function getAuthMethod() {
  const url = API_BASE_URL + '/auth';
  const res = await fetch(url);
  if (!res.ok) return 'basic';
  const data = await res.json();
  return data.method || 'basic';
}
