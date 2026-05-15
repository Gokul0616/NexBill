import React from 'react';

export default function Tooltip({ children, text, position = 'right', disabled = false }) {
  if (disabled) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className={`absolute ${positionClasses[position]} px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-sm`}>
        {text}
      </div>
    </div>
  );
}
