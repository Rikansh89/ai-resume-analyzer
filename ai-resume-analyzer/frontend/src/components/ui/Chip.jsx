import React from 'react';

const TONES = {
  ok: 'text-teal-700',
  warn: 'text-amber-700',
  err: 'text-red-600',
  accent: 'text-accent',
  muted: 'text-ink-muted',
};

const DOT = {
  ok: 'bg-teal-500',
  warn: 'bg-amber-500',
  err: 'bg-red-500',
  accent: 'bg-accent',
  muted: 'bg-ink-faint',
};

const Chip = ({ tone = 'muted', dot = false, children, className = '' }) => (
  <span className={`tag ${TONES[tone]} ${className}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT[tone]} flex-shrink-0`} aria-hidden="true" />}
    {children}
  </span>
);

export default Chip;
