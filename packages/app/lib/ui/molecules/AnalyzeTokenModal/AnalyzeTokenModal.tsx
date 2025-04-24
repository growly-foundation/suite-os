import { TMarketToken } from 'chainsmith-sdk/types';
import { Modal } from '../../atoms';

type Props = {
  token?: TMarketToken;
  open: boolean;
  walletAddress?: string;
  reviewFrequency?: string;
  riskLevel?: string;
  investmentObjective?: string;
  handleOpen: (open: boolean) => void;
};

const AnalyzeTokenModal = ({
  open,
  handleOpen,
  token,
  // reviewFrequency,
  // riskLevel,
  // investmentObjective,
  walletAddress,
}: Props) => {
  return (
    <Modal open={open} handleOpen={handleOpen}>
      <div>
        Hello {walletAddress} {token?.symbol}
      </div>
    </Modal>
  );
};

export default AnalyzeTokenModal;
