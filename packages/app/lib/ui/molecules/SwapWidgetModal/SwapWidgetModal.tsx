import { LiFiWidget, ToAddress, WidgetConfig } from '@lifi/widget';
import { Modal } from '../../atoms';
import { TChainId, TMarketToken } from 'chainsmith-sdk/types';

type Props = {
  type: 'TRANSFER' | 'SWAP';
  token?: TMarketToken;
  supportedChains?: TChainId[];
  open: boolean;
  toAddress?: ToAddress;
  handleOpen: (open: boolean) => void;
};

const widgetConfig: WidgetConfig = {
  integrator: 'Cream',
  variant: 'wide',
  appearance: 'light',
  theme: {
    container: {
      border: 'none',
    },
  },
};

const SwapWidgetModal = ({ type, open, handleOpen, token, toAddress, supportedChains }: Props) => {
  return (
    <Modal open={open} handleOpen={handleOpen}>
      <LiFiWidget
        integrator="Cream"
        hiddenUI={['poweredBy', 'language']}
        config={{
          ...widgetConfig,
          ...(token
            ? {
                fromChain: token.chainId,
                fromToken: token.symbol,
                toChain: type === 'TRANSFER' ? token.chainId : undefined,
                toToken: type === 'TRANSFER' ? token.symbol : undefined,
              }
            : {}),
          toAddress,
          ...(supportedChains
            ? {
                chains: {
                  from: { allow: supportedChains },
                  to: { allow: supportedChains },
                },
              }
            : {}),
        }}
      />
    </Modal>
  );
};

export default SwapWidgetModal;
