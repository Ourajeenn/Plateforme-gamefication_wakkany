export function sanitizeInput(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/<script[^>]*>.*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function reportError(error, context = {}) {
  const message = error?.message || 'Une erreur est survenue';

  console.error('Security report', { message, context });

  return {
    ok: true,
    message,
  };
}
