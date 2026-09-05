import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl',
  footer = null,
  layout = 'default',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPanel = layout === 'panel';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6 ${
        isPanel ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} rounded-[22px] bg-white shadow-2xl ${
          isPanel ? 'flex max-h-[90vh] flex-col overflow-hidden' : 'p-6'
        }`}
      >
        <div
          className={`flex items-start justify-between border-b border-slate-100 ${
            isPanel ? 'shrink-0 px-6 py-5' : 'pb-4'
          }`}
        >
          <div className="pr-4">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
            {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={
            isPanel
              ? 'min-h-0 flex-1 overflow-y-auto px-6 py-5 text-xs text-slate-700'
              : 'py-4 text-xs text-slate-700'
          }
        >
          {children}
        </div>

        {footer && (
          <div
            className={`flex items-center justify-end gap-2 border-t border-slate-100 ${
              isPanel ? 'shrink-0 px-6 py-4' : 'pt-4'
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
