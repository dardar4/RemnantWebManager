import { useEffect } from 'react';
import type { FC } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: FC<ToastProps> = ({ message, onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast-bar">
      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#84f5ee' }}>
        check_circle
      </span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: 0,
          marginLeft: '6px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8,
        }}
        title="Dismiss"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          close
        </span>
      </button>
    </div>
  );
};
