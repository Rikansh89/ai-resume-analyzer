import React from 'react';

const SIZES = {
  sm: 'w-8 h-8 rounded-btn',
  md: 'w-11 h-11 rounded-btn',
  lg: 'w-14 h-14 rounded-btn',
};

const IconWell = ({ size = 'md', tone = 'text-accent', className = '', children }) => (
  <span className={`icon-well ${SIZES[size]} ${tone} ${className}`} aria-hidden="true">
    {children}
  </span>
);

export default IconWell;
