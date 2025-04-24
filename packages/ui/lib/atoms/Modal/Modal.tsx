import type { ReactNode } from 'react';
import ReactModal from 'react-modal';

type Props = {
  open: boolean;
  handleOpen?: (open: boolean) => void;
  children: ReactNode;
};

const customStyles: ReactModal.Styles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 20,
    boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
  },
};

const Modal = ({ open, children, handleOpen }: Props) => {
  return (
    <ReactModal
      shouldCloseOnEsc
      onRequestClose={() => {
        if (handleOpen) handleOpen(false);
      }}
      isOpen={open}
      style={customStyles}>
      {children}
    </ReactModal>
  );
};

export default Modal;
