import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';

vi.mock('../lib/api.js', () => ({
  getFields: vi.fn(),
  getResourceItems: vi.fn(),
  createResourceItem: vi.fn(),
  updateResourceItem: vi.fn(),
  deleteResourceItem: vi.fn(),
}));

vi.mock('svelte-spa-router', () => ({
  link: () => {},
}));

import { getFields, getResourceItems, createResourceItem, updateResourceItem, deleteResourceItem } from '../lib/api.js';
import SettingsResourceManager from './SettingsResourceManager.svelte';

beforeEach(() => {
  vi.restoreAllMocks();
});

const fieldsResponse = {
  data: [
    { name: '_project', type: 'int', resource: { name: 'projects', path: '/projects' } },
    { name: '_email', type: 'bool' },
  ],
};

const itemsResponse = {
  data: [
    { id: 1, name: 'Alpha', entry_count: 5 },
    { id: 2, name: 'Beta', entry_count: 0 },
  ],
};

describe('SettingsResourceManager', () => {
  it('loads and displays resource items with IDs', async () => {
    getFields.mockResolvedValue(fieldsResponse);
    getResourceItems.mockResolvedValue(itemsResponse);

    render(SettingsResourceManager, { props: { params: { name: 'projects' } } });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('(5 entries)')).toBeInTheDocument();
    expect(screen.getByText('(0 entries)')).toBeInTheDocument();
  });

  it('shows entries link with correct href for each item', async () => {
    getFields.mockResolvedValue(fieldsResponse);
    getResourceItems.mockResolvedValue(itemsResponse);

    render(SettingsResourceManager, { props: { params: { name: 'projects' } } });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    const entriesLinks = screen.getAllByText('Entries');
    expect(entriesLinks).toHaveLength(2);
    expect(entriesLinks[0].getAttribute('href')).toBe('/?project_id=1');
    expect(entriesLinks[1].getAttribute('href')).toBe('/?project_id=2');
  });

  it('shows error for unknown resource', async () => {
    getFields.mockResolvedValue(fieldsResponse);

    render(SettingsResourceManager, { props: { params: { name: 'unknown' } } });

    await waitFor(() => {
      expect(screen.getByText(/Resource "unknown" not found/)).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    getFields.mockReturnValue(new Promise(() => {}));

    render(SettingsResourceManager, { props: { params: { name: 'projects' } } });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('adds a new item', async () => {
    getFields.mockResolvedValue(fieldsResponse);
    getResourceItems.mockResolvedValue(itemsResponse);
    createResourceItem.mockResolvedValue({ id: 3, name: 'Gamma' });

    render(SettingsResourceManager, { props: { params: { name: 'projects' } } });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('New item name');
    await fireEvent.input(input, { target: { value: 'Gamma' } });

    // After add, it re-fetches
    getResourceItems.mockResolvedValue({
      data: [...itemsResponse.data, { id: 3, name: 'Gamma', entry_count: 0 }],
    });

    await fireEvent.click(screen.getByText('Add'));

    expect(createResourceItem).toHaveBeenCalledWith('/projects', { name: 'Gamma' });
  });

  it('shows empty state when no items', async () => {
    getFields.mockResolvedValue(fieldsResponse);
    getResourceItems.mockResolvedValue({ data: [] });

    render(SettingsResourceManager, { props: { params: { name: 'projects' } } });

    await waitFor(() => {
      expect(screen.getByText(/No items yet/)).toBeInTheDocument();
    });
  });

  it('shows edit form when edit button is clicked', async () => {
    getFields.mockResolvedValue(fieldsResponse);
    getResourceItems.mockResolvedValue(itemsResponse);

    render(SettingsResourceManager, { props: { params: { name: 'projects' } } });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await fireEvent.click(editButtons[0]);

    // Should show Save and Cancel buttons
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    getFields.mockResolvedValue(fieldsResponse);
    getResourceItems.mockResolvedValue(itemsResponse);

    render(SettingsResourceManager, { props: { params: { name: 'projects' } } });

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });
  });
});
