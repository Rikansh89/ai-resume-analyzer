import React from 'react';

const Card = ({ as: Tag = 'div', inset = false, hover = false, className = '', ...props }) => {
  const base = inset ? 'card-inset' : 'card';
  return <Tag className={`${base} ${hover ? 'card-hover' : ''} ${className}`} {...props} />;
};

export default Card;
