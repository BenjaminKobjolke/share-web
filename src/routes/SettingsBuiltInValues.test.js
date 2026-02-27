import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

// Mock api.js
vi.mock('../lib/api.js', () => ({
  getFields: vi.fn(),
}));

// Mock svelte-spa-router's link action (accesses browser routing APIs)
vi.mock('svelte-spa-router', () => ({
  link: () => {},
}));

import { getFields } from '../lib/api.js';
import SettingsBuiltInValues from './SettingsBuiltInValues.svelte';

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('SettingsBuiltInValues', () => {
  it('renders fields from the API response envelope', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_project', type: 'string', description: 'Project name' },
        { name: '_email', type: 'bool', description: 'Send email' },
      ],
    });

    render(SettingsBuiltInValues);

    await waitFor(() => {
      expect(screen.getByText('Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Project name')).toBeInTheDocument();
    expect(screen.getByText('Send email')).toBeInTheDocument();
  });

  it('filters out _id field', async () => {
    getFields.mockResolvedValue({
      data: [
        { name: '_id', type: 'int' },
        { name: '_project', type: 'string' },
      ],
    });

    render(SettingsBuiltInValues);

    await waitFor(() => {
      expect(screen.getByText('Project')).toBeInTheDocument();
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
