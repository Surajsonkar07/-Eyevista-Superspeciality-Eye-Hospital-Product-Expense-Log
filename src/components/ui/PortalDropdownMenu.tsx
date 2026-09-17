import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface PortalDropdownMenuProps {
  trigger: React.ReactElement;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const PortalDropdownMenu: React.FC<PortalDropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    const menuWidth = 180;
    const menuHeight = items.length * 36 + 10;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlip = spaceBelow < menuHeight && rect.top > menuHeight;

    const top = shouldFlip ? rect.top + scrollY - menuHeight - 4 : rect.bottom + scrollY + 4;
    let left = align === 'right' ? rect.right + scrollX - menuWidth : rect.left + scrollX;

    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    if (left < 8) left = 8;

    setCoords({ top, left });
  }, [align, items.length]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      const handleOutsideClick = (e: MouseEvent) => {
        if (
          triggerRef.current?.contains(e.target as Node) ||
          menuRef.current?.contains(e.target as Node)
        ) {
          return;
        }
        setIsOpen(false);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, updatePosition]);

  const clonedTrigger = React.cloneElement(trigger, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const { ref } = trigger as any;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as any).current = node;
    },
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
      trigger.props.onClick?.(e);
    },
  });

  return (
    <>
      {clonedTrigger}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: '180px',
              zIndex: 99999,
            }}
            className={`rounded-xl bg-white/95 dark:bg-neutral-950/95 border border-stone-200/90 dark:border-neutral-800 shadow-2xl backdrop-blur-md p-1 text-xs animate-in fade-in zoom-in-95 duration-100 ${className}`}
          >
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.divider ? (
                  <div className="my-1 border-t border-stone-100 dark:border-neutral-800" />
                ) : (
                  <button
                    type="button"
                    disabled={item.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      item.danger
                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-stone-100/80 dark:hover:bg-neutral-900'
                    }`}
                  >
                    {item.icon && <span className="w-3.5 h-3.5 shrink-0 opacity-80">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};
