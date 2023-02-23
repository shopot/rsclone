import { useState } from 'react';

export const useModal = (initialOpenStatus = false) => {
  const [isOpen, setIsOpen] = useState(initialOpenStatus);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return [isOpen, toggle] as const;
};
