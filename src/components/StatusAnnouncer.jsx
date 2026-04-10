'use client';

/**
 * Visually hidden live region for screen reader announcements.
 * Usage: <StatusAnnouncer message={msg} />
 */
export function StatusAnnouncer({ message, assertive = false }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: 1, height: 1,
        padding: 0, margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {message}
    </div>
  );
}
