import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true
}) {
  const handleClose = onClose || onCancel || (() => {});

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" title={title}>
      <div className="flex items-start gap-3.5 py-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-700'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={handleClose} className="btn-secondary">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof onConfirm === 'function') onConfirm();
            handleClose();
          }}
          className={isDestructive ? 'btn-danger' : 'btn-primary'}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
