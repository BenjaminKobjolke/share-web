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
  getResourceItems, createResourceItem, updateResourceItem, deleteResourceItem,
  getCustomFields, createCustomField, updateCustomField, deleteCustomField,
  exportCustomFields, importCustomFields,
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

  it('appends filters as query params', async () => {
    const envelope = { entries: [], total: 0, page: 1, per_page: 20 };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(envelope));

    await getEntries(1, 20, { project_id: '3' });

    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('project_id=3');
    expect(url).toContain('page=1');
    expect(url).toContain('per_page=20');
  });

  it('omits empty or null filter values', async () => {
    const envelope = { entries: [], total: 0, page: 1, per_page: 20 };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(envelope));

    await getEntries(1, 20, { project_id: '', status_id: null });

    const [url] = global.fetch.mock.calls[0];
    expect(url).not.toContain('project_id');
    expect(url).not.toContain('status_id');
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

describe('getResourceItems', () => {
  it('fetches items from the given resource path', async () => {
    const body = { data: [{ id: 1, name: 'Alpha' }] };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(body));

    const result = await getResourceItems('/projects');

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Alpha');
    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/projects');
  });
});

describe('createResourceItem', () => {
  it('sends POST with JSON body', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 3, name: 'New' }));

    await createResourceItem('/projects', { name: 'New' });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/projects');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ name: 'New' });
  });
});

describe('updateResourceItem', () => {
  it('sends PUT with JSON body to item URL', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 1, name: 'Updated' }));

    await updateResourceItem('/projects', 1, { name: 'Updated' });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/projects/1');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({ name: 'Updated' });
  });
});

describe('deleteResourceItem', () => {
  it('sends DELETE to item URL', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ success: true }));

    await deleteResourceItem('/projects', 1);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/projects/1');
    expect(options.method).toBe('DELETE');
  });
});

describe('getCustomFields', () => {
  it('fetches custom fields list', async () => {
    const body = { data: [{ name: 'status', option_count: 3 }] };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(body));

    const result = await getCustomFields();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('status');
    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/custom-fields');
  });
});

describe('createCustomField', () => {
  it('sends POST with JSON body', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ name: 'priority' }));

    await createCustomField({ name: 'priority', description: 'Priority level' });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/custom-fields');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ name: 'priority', description: 'Priority level' });
  });
});

describe('updateCustomField', () => {
  it('sends PUT with JSON body to field URL', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ name: 'status', description: 'Updated' }));

    await updateCustomField('status', { description: 'Updated' });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/custom-fields/status');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({ description: 'Updated' });
  });
});

describe('deleteCustomField', () => {
  it('sends DELETE to field URL', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ success: true }));

    await deleteCustomField('status');

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/custom-fields/status');
    expect(options.method).toBe('DELETE');
  });
});

describe('exportCustomFields', () => {
  it('fetches export endpoint', async () => {
    const body = { fields: [{ name: 'status', options: ['open', 'closed'] }] };
    global.fetch.mockResolvedValueOnce(mockJsonResponse(body));

    const result = await exportCustomFields();

    expect(result.fields).toHaveLength(1);
    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/custom-fields/export');
  });
});

describe('importCustomFields', () => {
  it('sends POST with JSON body to import endpoint', async () => {
    const importData = { fields: [{ name: 'status', options: ['open'] }] };
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ imported: 1 }));

    await importCustomFields(importData);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/custom-fields/import');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(importData);
  });
});
