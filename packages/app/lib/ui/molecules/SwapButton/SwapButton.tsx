import { TChainId, TMarketToken } from 'chainsmith-sdk/types';
import { Button, TooltipContainer } from '../../atoms';
import SwapWidgetModal from '../SwapWidgetModal/SwapWidgetModal';
import { useState } from 'react';
import { ToAddress } from '@lifi/widget';
import { ButtonProps } from '@radix-ui/themes';
import { makeid } from '@/core';

type Props = {
  type: 'TRANSFER' | 'SWAP';
  token?: TMarketToken;
  supportedChains?: TChainId[];
  tooltipContent: string;
  children: React.ReactNode;
  toAddress?: ToAddress;
  buttonProps?: ButtonProps;
};

const SwapButton = ({
  type,
  children,
  token,
  supportedChains,
  toAddress,
  tooltipContent,
  buttonProps,
}: Props) => {
  const [openSwapModal, setOpenSwapModal] = useState<boolean>(false);
  return (
    <TooltipContainer
      tooltipId={`${token?.chainId || makeid(3)}-${token?.name || makeid(3)}-swap`}
      tooltipContent={tooltipContent}>
      <Button {...buttonProps} onClick={() => setOpenSwapModal(true)} size={'2'} color="green">
        {children}
      </Button>
      <SwapWidgetModal
        type={type}
        token={token}
        supportedChains={supportedChains}
        open={openSwapModal}
        toAddress={toAddress}
        handleOpen={open => setOpenSwapModal(open)}
      />
    </TooltipContainer>
  );
};

export default SwapButton;
