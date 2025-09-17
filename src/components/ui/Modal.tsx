import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'twoThirds';
}
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const sizeClasses = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large,
    xl: styles.extraLarge,
    twoThirds: styles.twoThirds
  };
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={`${styles.modalContainer} ${sizeClasses[size]}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Закрыть модальное окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
  return createPortal(modalContent, document.body);
};