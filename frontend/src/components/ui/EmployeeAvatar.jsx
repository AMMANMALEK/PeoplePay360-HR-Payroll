import React, { useState } from 'react';

export default function EmployeeAvatar({ name = '', src = '', size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'PP';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizeMap = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base font-semibold',
    xl: 'h-20 w-20 text-xl font-bold'
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`inline-block shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm ${selectedSize} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 font-medium text-white ring-2 ring-white shadow-sm ${selectedSize} ${className}`}
      title={name}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
