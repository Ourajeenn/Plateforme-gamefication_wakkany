import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeInput, reportError } from './security';

describe('security utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('strips unsafe HTML and normalizes whitespace from user input', () => {
    expect(sanitizeInput('  <script>alert(1)</script> Bonjour  ')).toBe('Bonjour');
    expect(sanitizeInput('  hello\nworld  ')).toBe('hello world');
  });

  it('reports errors through the console and keeps the context', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const error = new Error('boom');
    const result = reportError(error, { feature: 'auth' });

    expect(result).toMatchObject({ ok: true, message: 'boom' });
    expect(consoleSpy).toHaveBeenCalled();
  });
});
