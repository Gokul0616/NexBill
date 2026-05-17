import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * CustomTooltip with Portal Support, Hover/Click Trigger, and Responsive wrapping
 */
export default function Tooltip({
  children,
  text,
  position = 'right',
  disabled = false,
  sidebar = false,
  trigger = 'hover',
  maxWidth = '320px',
}) {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
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
    if (disabled || trigger !== 'hover') return;
    updatePosition();
    setRender(true);
    timerRef.current = setTimeout(() => {
      setShow(true);
    }, sidebar ? 500 : 0);
  };

  const handleMouseLeave = () => {
    if (trigger !== 'hover') return;
    clearTimeout(timerRef.current);
    setShow(false);
    setTimeout(() => setRender(false), 200);
  };

  const handleClick = (e) => {
    if (disabled || trigger !== 'click') return;
    e.stopPropagation();

    if (show) {
      setShow(false);
      setTimeout(() => setRender(false), 200);
    } else {
      updatePosition();
      setRender(true);
      setTimeout(() => {
        setShow(true);
      }, 0);
    }
  };

  // Click outside to close (strictly for click trigger)
  useEffect(() => {
    if (trigger !== 'click' || !show) return;
    const handleOutsideClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        (!tooltipRef.current || !tooltipRef.current.contains(e.target))
      ) {
        setShow(false);
        setTimeout(() => setRender(false), 200);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [show, trigger]);

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
        onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
        onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
        onClick={trigger === 'click' ? handleClick : undefined}
      >
        {children}
      </div>

      {render && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: transformMap[position],
            zIndex: 99999,
            pointerEvents: 'none',
            maxWidth: !sidebar ? maxWidth : undefined,
          }}
        >
          <div
            className={`
              bg-white dark:bg-[#1a1a1a]
              text-[#30313d] dark:text-gray-100
              font-semibold text-[12px]
              shadow-lg dark:shadow-2xl
              border border-slate-200/80 dark:border-white/10
              transition-all
              duration-200
              rounded-md
              relative
              ${sidebar
                ? 'px-2.5 py-1.5 whitespace-nowrap'
                : 'px-3 py-2 font-normal whitespace-normal text-center leading-normal'
              }
              ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}
          >
            {text}
            {!sidebar && (
              <div
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: 'inherit',
                  border: 'inherit',
                  transform: 'rotate(45deg)',
                  zIndex: -1,
                }}
                className={`
                  ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-0 border-l-0' : ''}
                  ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-b-0 border-r-0' : ''}
                  ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-b-0 border-l-0' : ''}
                  ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2 border-t-0 border-r-0' : ''}
                `}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}