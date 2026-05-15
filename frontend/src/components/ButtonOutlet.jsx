import React from 'react';
import CustomTooltip from './CustomTooltip';

const ButtonOutlet = ({
    icon: Icon,
    label,
    onClick,
    title,
    disabled,
    variant = 'default',
    className = '',
    type = 'button'
}) => {
    const baseStyles =
        "h-[30px] rounded-md transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer";

    const variants = {
        default:
            "bg-[#246dff] text-white hover:bg-blue-600 dark:bg-[#246dff] dark:hover:bg-blue-500 shadow-sm border border-transparent",

        secondary:
            "bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#222] shadow-sm",

        danger:
            "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/20 shadow-sm"
    };

    const button = (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${label ? 'px-3' : 'w-[30px] shrink-0'}
        ${className}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
        >
            {Icon && (
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            )}

            {label && (
                <span className="text-sm font-semibold">
                    {label}
                </span>
            )}
        </button>
    );


    return button;
};

export default ButtonOutlet;