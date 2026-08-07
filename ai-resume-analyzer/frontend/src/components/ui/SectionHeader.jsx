import React from 'react';
import IconWell from './IconWell';

const SectionHeader = ({ icon, title, hint }) => (
  <div className="flex items-center gap-3">
    {icon && <IconWell size="sm">{icon}</IconWell>}
    <h3 className="font-display font-bold text-ink tracking-tight">{title}</h3>
    {hint && <span className="text-xs text-ink-faint ml-auto">{hint}</span>}
  </div>
);

export default SectionHeader;
