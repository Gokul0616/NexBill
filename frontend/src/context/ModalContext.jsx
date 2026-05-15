import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    content: null,
    size: 'md', // sm, md, lg, xl
  });

  const openModal = (title, content, size = 'md') => {
    setModalConfig({ title, content, size });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Reset config after animation would be better, but simple for now
  };

  return (
    <ModalContext.Provider value={{ isOpen, modalConfig, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
