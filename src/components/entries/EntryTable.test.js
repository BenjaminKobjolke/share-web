import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

const pushMock = vi.fn();

vi.mock('svelte-spa-router', () => ({
  link: () => {},
  push: (...args) => pushMock(...args),
}));

vi.mock('../../lib/fields.js', () => ({
  fieldToColumn: (name) => name.replace(/^_/, '') + '_id',
}));

import EntryTable from './EntryTable.svelte';

beforeEach(() => {
  vi.restoreAllMocks();
  pushMock.mockClear();
});

const entries = [
  { id: 1, type: 'file', subject: 'First entry', attachment_count: 2, created_at: '2025-01-15T10:00:00Z' },
  { id: 2, type: 'note', subject: 'Second entry', attachment_count: 0, created_at: '2025-01-16T12:00:00Z' },
];

describe('EntryTable', () => {
  it('renders entry rows', () => {
    render(EntryTable, { props: { entries } });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('First entry')).toBeInTheDocument();
    expect(screen.getByText('Second entry')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(EntryTable, { props: { entries: [] } });

    expect(screen.getByText('No entries found')).toBeInTheDocument();
  });

  it('navigates to entry detail when row is clicked', async () => {
    render(EntryTable, { props: { entries } });

    await fireEvent.click(screen.getByText('First entry'));

    expect(pushMock).toHaveBeenCalledWith('/entries/1');
  });

  it('navigates to correct entry when different row is clicked', async () => {
    render(EntryTable, { props: { entries } });

    await fireEvent.click(screen.getByText('Second entry'));

    expect(pushMock).toHaveBeenCalledWith('/entries/2');
  });

  it('has the ID link for accessibility', () => {
    render(EntryTable, { props: { entries } });

    const link = screen.getByText('#1');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/entries/1');
  });

  it('renders dynamic resource columns', () => {
    const resourceFields = [
      { name: '_project', type: 'int', resource: { name: 'projects', path: '/projects' } },
    ];
    const resourceMaps = { _project: { 1: 'Alpha', 2: 'Beta' } };
    const entriesWithProject = [
      { id: 1, type: 'file', subject: 'First', attachment_count: 0, created_at: '2025-01-15T10:00:00Z', project_id: 1 },
      { id: 2, type: 'note', subject: 'Second', attachment_count: 0, created_at: '2025-01-16T12:00:00Z', project_id: 2 },
    ];

    render(EntryTable, { props: { entries: entriesWithProject, resourceFields, resourceMaps } });

    // Column header
    expect(screen.getByText('projects')).toBeInTheDocument();
    // Resolved values
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows dash for unresolved resource values', () => {
    const resourceFields = [
      { name: '_project', type: 'int', resource: { name: 'projects', path: '/projects' } },
    ];
    const resourceMaps = { _project: { 1: 'Alpha' } };
    const entriesWithProject = [
      { id: 1, type: 'file', subject: 'First', attachment_count: 0, created_at: '2025-01-15T10:00:00Z', project_id: 99 },
    ];

    render(EntryTable, { props: { entries: entriesWithProject, resourceFields, resourceMaps } });

    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });
});
