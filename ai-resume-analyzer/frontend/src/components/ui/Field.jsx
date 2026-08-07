import React from 'react';

const Field = ({ label, hint, as: Tag = 'input', className = '', id, ...props }) => {
  const labelId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      {label && (
        <label htmlFor={labelId} className="label">
          {label}
          {hint && <span className="font-normal text-ink-faint"> · {hint}</span>}
        </label>
      )}
      <Tag id={labelId} className={`input ${className}`} {...props} />
    </div>
  );
};

export default Field;
