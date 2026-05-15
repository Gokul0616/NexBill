import React from 'react';
import CustomTooltip from './CustomTooltip';

const ActionButton = ({ icon: Icon, label, onClick, title, disabled, variant = 'default', className = '', type = 'button' }) => {
  const baseStyles = "min-h-[30px] py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer";
  const variants = {
    default: "bg-[#246dff] text-white hover:bg-[#1e5ce6] border border-transparent shadow-sm",
    secondary: "bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-[#333] shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 shadow-sm"
  };

  const button = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${label ? 'px-3' : 'w-[30px] shrink-0'} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {label && <span className="text-sm font-semibold">{label}</span>}
    </button>
  );

  if (title) {
    return (
      <CustomTooltip text={title}>
        {button}
      </CustomTooltip>
    );
  }

  return button;
};

export default ActionButton;
