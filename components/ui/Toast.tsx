'use client';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 2800);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      {message}
    </div>
  );
}
