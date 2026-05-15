import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * CustomTooltip with Portal Support and Original Design/Transitions
 */
export default function Tooltip({
  children,
  text,
  position = 'right',
  disabled = false,
  sidebar = false,
}) {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timerRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top, left;

      if (position === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
      } else if (position === 'left') {
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
      } else if (position === 'top') {
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
      } else if (position === 'bottom') {
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
      }

      setCoords({ top, left });
    }
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    updatePosition();
    
    // Start rendering (for transition)
    setRender(true);
    
    // Original 500ms delay for sidebar tooltips
    timerRef.current = setTimeout(() => {
      setShow(true);
    }, sidebar ? 500 : 0);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setShow(false);
    // Remove from DOM after transition
    setTimeout(() => setRender(false), 200);
  };

  useEffect(() => {
    if (show) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timerRef.current);
    };
  }, [show]);

  const transformMap = {
    right: 'translateY(-50%)',
    left: 'translateY(-50%) translateX(-100%)',
    top: 'translateX(-50%) translateY(-100%)',
    bottom: 'translateX(-50%)',
  };

  if (disabled) return <>{children}</>;

  return (
    <>
      <div
        ref={triggerRef}
        className="relative flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {render && createPortal(
        <div
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: transformMap[position],
            zIndex: 99999,
            pointerEvents: 'none',
          }}
          className={`
            px-2.5 py-1.5
            bg-gray-900 dark:bg-[#1a1a1a]
            text-white dark:text-gray-100
            text-[12px] font-semibold
            rounded-md
            whitespace-nowrap
            shadow-xl
            border border-transparent dark:border-white/10
            transition-all
            duration-200
            ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  );
}