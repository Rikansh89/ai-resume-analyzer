import React from 'react';
import { Link } from 'react-router-dom';

const Spinner = () => (
  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" aria-hidden="true" />
);

const Button = ({
  variant = 'primary',
  to,
  type = 'button',
  className = '',
  loading = false,
  children,
  ...props
}) => {
  const cls = `btn btn-${variant} focus-ring ${className}`;
  const content = (
    <>
      {loading && <Spinner />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={loading} {...props}>
      {content}
    </button>
  );
};

export default Button;
