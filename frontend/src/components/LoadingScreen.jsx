import React from 'react';

const LoadingScreen = ({ text = "Loading...", fullScreen = false }) => {
    return (
        <div className={`
            flex flex-col items-center justify-center 
            ${fullScreen ? 'fixed inset-0 bg-white dark:bg-[#0d0d0d] z-[9999]' : 'min-h-[400px] flex-1'}
            animate-in fade-in duration-500
        `}>
            <div className="w-8 h-8 border-2 border-[#5469d4]/20 border-t-[#5469d4] rounded-full animate-spin mb-4" />
            <p className="text-[13px] text-[#697386] font-medium">{text}</p>
        </div>
    );
};

export default LoadingScreen;
