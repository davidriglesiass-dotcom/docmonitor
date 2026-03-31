'use client';
import { ReactNode } from 'react';

interface ModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ id, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {children}
      </div>
    </div>
  );
}
