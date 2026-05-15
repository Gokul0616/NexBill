import { X } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import ButtonOutlet from './ButtonOutlet';

export default function GlobalModal() {
  const { isOpen, modalConfig, closeModal } = useModal();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop - ensured fixed inset-0 and higher z-index */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[6px] transition-opacity"
        onClick={closeModal}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${sizeClasses[modalConfig.size] || sizeClasses.md} bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-[10000]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1a1a1a]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {modalConfig.title}
          </h2>
          <ButtonOutlet
            icon={X}
            onClick={closeModal}
            variant="secondary"
            className="rounded-full"
          />
        </div>

        <div className="p-6">
          {modalConfig.content}
        </div>
      </div>
    </div>,
    document.body
  );
}
