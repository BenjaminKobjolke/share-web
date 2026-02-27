import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';

vi.mock('../lib/api.js', () => ({
  getCustomFields: vi.fn(),
  createCustomField: vi.fn(),
  updateCustomField: vi.fn(),
  deleteCustomField: vi.fn(),
  exportCustomFields: vi.fn(),
  importCustomFields: vi.fn(),
}));

vi.mock('svelte-spa-router', () => ({
  link: () => {},
}));

import {
  getCustomFields, createCustomField, updateCustomField,
  deleteCustomField, exportCustomFields, importCustomFields,
} from '../lib/api.js';
import SettingsCustomFields from './SettingsCustomFields.svelte';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

const fieldsResponse = {
  data: [
    { name: 'status', description: 'Issue status', sort_order: 1, option_count: 3 },
    { name: 'resolution', description: '', sort_order: 2, option_count: 5 },
  ],
};

describe('SettingsCustomFields', () => {
  it('loads and displays custom fields', async () => {
    getCustomFields.mockResolvedValue(fieldsResponse);

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('status')).toBeInTheDocument();
      expect(screen.getByText('resolution')).toBeInTheDocument();
    });

    expect(screen.getByText('(3 options)')).toBeInTheDocument();
    expect(screen.getByText('(5 options)')).toBeInTheDocument();
    expect(screen.getByText('Issue status')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    getCustomFields.mockReturnValue(new Promise(() => {}));

    render(SettingsCustomFields);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error on load failure', async () => {
    getCustomFields.mockRejectedValue(new Error('Network error'));

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows empty state when no fields', async () => {
    getCustomFields.mockResolvedValue({ data: [] });

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText(/No custom fields yet/)).toBeInTheDocument();
    });
  });

  it('creates a new custom field', async () => {
    getCustomFields.mockResolvedValue({ data: [] });
    createCustomField.mockResolvedValue({ name: 'priority' });

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText(/No custom fields yet/)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Field name');
    await fireEvent.input(nameInput, { target: { value: 'priority' } });

    getCustomFields.mockResolvedValue({
      data: [{ name: 'priority', description: '', sort_order: 0, option_count: 0 }],
    });

    await fireEvent.click(screen.getByText('Add'));

    expect(createCustomField).toHaveBeenCalledWith({
      name: 'priority',
      description: '',
      sort_order: 0,
    });
  });

  it('validates field name format', async () => {
    getCustomFields.mockResolvedValue({ data: [] });

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText(/No custom fields yet/)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Field name');
    await fireEvent.input(nameInput, { target: { value: 'Invalid Name' } });

    await fireEvent.click(screen.getByText('Add'));

    expect(createCustomField).not.toHaveBeenCalled();
    expect(screen.getByText(/must start with a lowercase letter/)).toBeInTheDocument();
  });

  it('shows edit form when edit button is clicked', async () => {
    getCustomFields.mockResolvedValue(fieldsResponse);

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('status')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await fireEvent.click(editButtons[0]);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('saves edited field', async () => {
    getCustomFields.mockResolvedValue(fieldsResponse);
    updateCustomField.mockResolvedValue({});

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('status')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await fireEvent.click(editButtons[0]);

    const descInput = screen.getByPlaceholderText('Description');
    await fireEvent.input(descInput, { target: { value: 'Updated desc' } });

    getCustomFields.mockResolvedValue(fieldsResponse);
    await fireEvent.click(screen.getByText('Save'));

    expect(updateCustomField).toHaveBeenCalledWith('status', {
      description: 'Updated desc',
      sort_order: 1,
    });
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    getCustomFields.mockResolvedValue(fieldsResponse);

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('status')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/will permanently delete the field/)).toBeInTheDocument();
    });
  });

  it('shows options link for each field', async () => {
    getCustomFields.mockResolvedValue(fieldsResponse);

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('status')).toBeInTheDocument();
    });

    const optionsLinks = screen.getAllByText('Options');
    expect(optionsLinks).toHaveLength(2);
    expect(optionsLinks[0].getAttribute('href')).toBe('/settings/resources/status');
    expect(optionsLinks[1].getAttribute('href')).toBe('/settings/resources/resolution');
  });

  it('shows singular option text for count of 1', async () => {
    getCustomFields.mockResolvedValue({
      data: [{ name: 'type', description: '', sort_order: 0, option_count: 1 }],
    });

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('(1 option)')).toBeInTheDocument();
    });
  });

  it('has export and import buttons', async () => {
    getCustomFields.mockResolvedValue(fieldsResponse);

    render(SettingsCustomFields);

    await waitFor(() => {
      expect(screen.getByText('status')).toBeInTheDocument();
    });

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });
});
