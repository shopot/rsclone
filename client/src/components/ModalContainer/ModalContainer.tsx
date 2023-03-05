import styles from './ModalContainer.m.scss';
import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

export const ModalContainer = ({ isOpen, toggle, children }: IModalProps) => {
  ReactModal.setAppElement('#app');

  const handleClose = (e: React.MouseEvent): void => {
    e.stopPropagation();
    toggle();
  };

  return (
    <ReactModal
      closeTimeoutMS={450}
      isOpen={isOpen}
      contentLabel="onRequestClose Example"
      onRequestClose={toggle}
      shouldCloseOnOverlayClick={true}
      overlayClassName={{
        base: styles.modalOverlay,
        afterOpen: styles.modalOverlayAfterOpen,
        beforeClose: styles.modalOverlayBeforeClose,
      }}
      className={styles.modalBox}
    >
      {children}
      <button
        className={styles.close}
        onClick={handleClose}
        type="button"
      ></button>
    </ReactModal>
  );
};

interface IModalProps {
  isOpen: boolean;
  toggle: () => void;
  children?: ReactNode;
}

ModalContainer.defaultProps = {
  isOpen: false,
};
