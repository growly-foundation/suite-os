import { Modal } from '../../atoms';

type Props = {
  open: boolean;
  handleOpen: (open: boolean) => void;
};

const YieldFarmingModal = ({ open, handleOpen }: Props) => {
  return (
    <Modal open={open} handleOpen={handleOpen}>
      Nothing here
    </Modal>
  );
};

export default YieldFarmingModal;
