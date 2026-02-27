import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./api.js', () => ({
  getFields: vi.fn(),
  getResourceItems: vi.fn(),
}));

import { getFields, getResourceItems } from './api.js';
import { loadResourceFields, fieldToColumn } from './fields.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('fieldToColumn', () => {
  it('converts _project to project_id', () => {
    expect(fieldToColumn('_project')).toBe('project_id');
  });

  it('converts _category to category_id', () => {
    expect(fieldToColumn('_category')).toBe('category_id');
  });

  it('handles field without underscore prefix', () => {
    expect(fieldToColumn('status')).toBe('status_id');
  });
});

describe('loadResourceFields', () => {
  it('returns resource fields and resolved maps', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_id', type: 'int' },
        { name: '_email', type: 'bool' },
        { name: '_project', type: 'int', resource: { name: 'projects', path: '/projects' } },
      ],
    });
    getResourceItems.mockResolvedValue({
      data: [
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Beta' },
      ],
    });

    const { resourceFields, resourceMaps } = await loadResourceFields();

    expect(resourceFields).toHaveLength(1);
    expect(resourceFields[0].name).toBe('_project');
    expect(resourceMaps._project).toEqual({ 1: 'Alpha', 2: 'Beta' });
  });

  it('returns empty map on resource fetch failure', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_project', type: 'int', resource: { name: 'projects', path: '/projects' } },
      ],
    });
    getResourceItems.mockRejectedValue(new Error('Network error'));

    const { resourceFields, resourceMaps } = await loadResourceFields();

    expect(resourceFields).toHaveLength(1);
    expect(resourceMaps._project).toEqual({});
  });

  it('handles multiple resource fields', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_project', type: 'int', resource: { name: 'projects', path: '/projects' } },
        { name: '_category', type: 'int', resource: { name: 'categories', path: '/categories' } },
      ],
    });
    getResourceItems
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Proj A' }] })
      .mockResolvedValueOnce({ data: [{ id: 10, name: 'Cat X' }] });

    const { resourceFields, resourceMaps } = await loadResourceFields();

    expect(resourceFields).toHaveLength(2);
    expect(resourceMaps._project).toEqual({ 1: 'Proj A' });
    expect(resourceMaps._category).toEqual({ 10: 'Cat X' });
  });

  it('returns empty when no resource fields exist', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_email', type: 'bool' },
      ],
    });

    const { resourceFields, resourceMaps } = await loadResourceFields();

    expect(resourceFields).toHaveLength(0);
    expect(resourceMaps).toEqual({});
  });
});
