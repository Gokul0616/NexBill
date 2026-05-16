import CustomTooltip from './CustomTooltip';
import { Loader2 } from 'lucide-react';

const ActionButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    title, 
    disabled, 
    loading = false,
    variant = 'default', 
    className = '', 
    type = 'button',
    size = 'md'
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#635bff]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
    
    const sizes = {
        sm: "h-7 px-2 text-[12px] gap-1.5",
        md: "h-[30px] px-3 text-[13px] gap-1.5",
        lg: "h-9 px-4 text-[14px] gap-2"
    };

    const variants = {
        default: "bg-[#635bff] hover:bg-[#5469d4] text-white shadow-sm border border-transparent",
        secondary: "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 shadow-sm",
        danger: "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/20",
        ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5",
    };

    const button = (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${baseStyles}
                ${sizes[size]}
                ${variants[variant]}
                ${!label ? 'w-[30px] shrink-0' : ''}
                ${className}
            `}
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <>
                    {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                    {label && <span>{label}</span>}
                </>
            )}
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
