import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  shortcut?: string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 80,
  shortcut,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;
    const offset = 8;

    switch (position) {
      case 'top':
        top = rect.top + scrollY - offset;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollY + offset;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - offset;
        break;
      case 'right':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + offset;
        break;
    }

    setCoords({ top, left });
  }, [position]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isVisible, updatePosition]);

  const clonedChild = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const { ref } = children as any;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as any).current = node;
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleMouseEnter();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleMouseLeave();
      children.props.onBlur?.(e);
    },
  });

  const getTransformClasses = () => {
    switch (position) {
      case 'top':
        return '-translate-x-1/2 -translate-y-full';
      case 'bottom':
        return '-translate-x-1/2 translate-y-0';
      case 'left':
        return '-translate-x-full -translate-y-1/2';
      case 'right':
        return 'translate-x-0 -translate-y-1/2';
    }
  };

  return (
    <>
      {clonedChild}
      {isVisible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className={`fixed z-[99999] pointer-events-none transition-opacity duration-150 ease-out transform ${getTransformClasses()} ${className}`}
            role="tooltip"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/95 dark:bg-neutral-900/95 text-white text-[11px] font-medium leading-none shadow-xl border border-slate-700/50 dark:border-neutral-700/60 backdrop-blur-xs whitespace-nowrap animate-in fade-in zoom-in-95">
              <span>{content}</span>
              {shortcut && (
                <kbd className="px-1 py-0.5 text-[9px] font-mono bg-white/20 text-slate-200 rounded">
                  {shortcut}
                </kbd>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
