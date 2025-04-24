import { Button, TooltipContainer } from '../../atoms';

import { useState } from 'react';
import { ButtonProps } from '@radix-ui/themes';
import { agentService, makeid } from '@/core';
import AnalyzeTokenModal from '../AnalyzeTokenModal/AnalyzeTokenModal';

type Props = {
  token?: any;
  tooltipContent: string;
  children: React.ReactNode;
  walletAddress?: string;
  reviewFrequency?: string;
  riskLevel?: string;
  investmentObjective?: string;
  buttonProps?: ButtonProps;
};

const AnalyzeTokenButton = ({
  children,
  token,
  walletAddress,
  reviewFrequency,
  riskLevel,
  investmentObjective,
  tooltipContent,
  buttonProps,
}: Props) => {
  const [openAnalyzeModal, setOpenAnalyzeModal] = useState<boolean>(false);

  const prompt = `RECOMMEND ACTION for TOKEN $${token.symbol} for wallet address ${walletAddress} with ${reviewFrequency?.toUpperCase()} check frequency, ${riskLevel?.toUpperCase()} risk, and ${investmentObjective?.toUpperCase()} investment objective`;

  return (
    <TooltipContainer
      tooltipId={`${token?.chainId || makeid(3)}-${token?.name || makeid(3)}-Analyze`}
      tooltipContent={tooltipContent}>
      <Button
        {...buttonProps}
        onClick={async () => {
          const response = await agentService.sendMessage(
            'd1e2abc1-8a8b-008f-a204-71e42c72adf3',
            prompt
          );
          console.log(response);
          setOpenAnalyzeModal(true);
        }}
        size={'2'}
        color="teal">
        {children}
      </Button>
      <AnalyzeTokenModal
        token={token}
        open={openAnalyzeModal}
        walletAddress={walletAddress}
        handleOpen={open => setOpenAnalyzeModal(open)}
      />
    </TooltipContainer>
  );
};

export default AnalyzeTokenButton;
