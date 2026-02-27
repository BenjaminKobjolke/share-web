import { describe, it, expect } from 'vitest';
import { formatDate, formatFileSize, truncate } from './utils.js';

describe('formatFileSize', () => {
  it('returns "0 B" for null/zero', () => {
    expect(formatFileSize(null)).toBe('0 B');
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
  });
});

describe('truncate', () => {
  it('returns empty string for falsy input', () => {
    expect(truncate('')).toBe('');
    expect(truncate(null)).toBe('');
  });

  it('returns string unchanged if within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });
});

describe('formatDate', () => {
  it('returns empty string for falsy input', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  it('returns a non-empty string for valid ISO date', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
