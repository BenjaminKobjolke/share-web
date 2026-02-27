import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

// Mock api.js
vi.mock('../lib/api.js', () => ({
  getFields: vi.fn(),
  getResourceItems: vi.fn(),
}));

// Mock svelte-spa-router's link action (accesses browser routing APIs)
vi.mock('svelte-spa-router', () => ({
  link: () => {},
}));

import { getFields, getResourceItems } from '../lib/api.js';
import SettingsBuiltInValues from './SettingsBuiltInValues.svelte';

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('SettingsBuiltInValues', () => {
  it('renders fields from the API response envelope', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_project', type: 'int', description: 'Select a project', resource: { name: 'projects', path: '/projects' } },
        { name: '_email', type: 'bool', description: 'Send email' },
      ],
    });
    getResourceItems.mockResolvedValue({ data: [{ id: 1, name: 'Alpha' }] });

    render(SettingsBuiltInValues);

    await waitFor(() => {
      expect(screen.getByLabelText('Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Send email')).toBeInTheDocument();
  });

  it('renders resource field as select dropdown', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_project', type: 'int', description: 'Select a project', resource: { name: 'projects', path: '/projects' } },
      ],
    });
    getResourceItems.mockResolvedValue({
      data: [
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Beta' },
      ],
    });

    render(SettingsBuiltInValues);

    await waitFor(() => {
      expect(screen.getByLabelText('Project')).toBeInTheDocument();
    });

    // Should render a select with the resource options
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });
  });

  it('filters out _id field', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_id', type: 'int' },
        { name: '_email', type: 'bool' },
      ],
    });

    render(SettingsBuiltInValues);

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    expect(screen.queryByText('Id')).not.toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    getFields.mockReturnValue(new Promise(() => {}));

    render(SettingsBuiltInValues);

    expect(screen.getByText('Loading fields...')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    getFields.mockRejectedValue(new Error('Network error'));

    render(SettingsBuiltInValues);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load fields/)).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('shows error when response lacks .data property', async () => {
    // Simulate old bug: getFields returns an array instead of { data: [...] }
    getFields.mockResolvedValue([
      { name: '_project', type: 'string' },
    ]);

    render(SettingsBuiltInValues);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load fields/)).toBeInTheDocument();
    });
  });
});
