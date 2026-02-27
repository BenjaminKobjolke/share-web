import { vi, describe, it, expect, beforeEach } from 'vitest';

// vi.hoisted runs before vi.mock hoisting, so mockLogout is defined in time
const { mockLogout } = vi.hoisted(() => ({ mockLogout: vi.fn() }));

vi.mock('../stores/auth.js', async () => {
  const { writable } = await import('svelte/store');
  const store = writable({ username: 'user', password: 'pass' });
  return {
    authStore: {
      subscribe: store.subscribe,
      login: vi.fn(),
      logout: mockLogout,
      loginAnonymous: vi.fn(),
    },
  };
});

import {
  getFields, getEntries, getEntry, getAuthMethod,
  deleteEntry, updateEntry, testAuth,
} from './api.js';

function mockJsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockLogout.mockClear();
  global.fetch = vi.fn();
});

describe('getFields', () => {
  it('returns the full envelope including .data array', async () => {
    const envelope = {
      data: [
        { name: '_project', type: 'string' },
        { name: '_email', type: 'bool' },
      ],
      version: '1.0',
    };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(envelope));

    const result = await getFields();

    expect(result).toEqual(envelope);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data).toHaveLength(2);
  });

  it('result.data is filterable (prevents the .filter() bug)', async () => {
    const envelope = {
      data: [
        { name: '_id', type: 'int' },
        { name: '_project', type: 'string' },
      ],
    };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(envelope));

    const result = await getFields();
    const filtered = result.data.filter(f => f.name !== '_id');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('_project');
  });
});

describe('getEntries', () => {
  it('returns the paginated envelope', async () => {
    const envelope = {
      entries: [{ id: 1, subject: 'Test' }],
      total: 1,
      page: 1,
      per_page: 20,
    };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(envelope));

    const result = await getEntries(1, 20);

    expect(result.entries).toBeInstanceOf(Array);
    expect(result.total).toBe(1);
  });
});

describe('getEntry', () => {
  it('returns parsed JSON body', async () => {
    const body = { id: 5, subject: 'Test', body: 'content' };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(body));

    const result = await getEntry(5);

    expect(result.id).toBe(5);
    expect(result.subject).toBe('Test');
  });
});

describe('error handling', () => {
  it('throws on non-ok response with error message', async () => {
    global.fetch.mockResolvedValueOnce(
      mockJsonResponse({ error: 'Not found' }, false, 404)
    );

    await expect(getEntry(999)).rejects.toThrow('Not found');
  });

  it('calls authStore.logout on 401', async () => {
    const origHash = window.location.hash;
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({}),
    });

    await expect(getFields()).rejects.toThrow('Unauthorized');
    expect(mockLogout).toHaveBeenCalled();
    window.location.hash = origHash;
  });
});

describe('getAuthMethod', () => {
  it('returns the method from the response', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ method: 'basic' }));

    const method = await getAuthMethod();

    expect(method).toBe('basic');
  });

  it('defaults to basic on failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const method = await getAuthMethod();

    expect(method).toBe('basic');
  });
});

describe('auth header', () => {
  it('sends Basic auth header when user is logged in', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ data: [] }));

    await getFields();

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toMatch(/^Basic /);
  });
});

describe('testAuth', () => {
  it('calls /fields endpoint', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ data: [] }));

    await testAuth();

    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/fields');
  });
});
