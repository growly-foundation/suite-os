import React, { useState } from 'react';
import { Button, TooltipContainer } from '../../atoms';
import { YieldFarmingModal } from '..';
import { ButtonProps } from '@radix-ui/themes';

const YieldFarmingButton = ({
  children,
  tooltipContent,
  buttonProps,
}: {
  tooltipContent: string;
  children: React.ReactNode;
  buttonProps?: ButtonProps;
}) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  return (
    <TooltipContainer tooltipId={`yield-farming`} tooltipContent={tooltipContent}>
      <Button {...buttonProps} onClick={() => setOpenModal(true)} size={'2'}>
        {children}
      </Button>
      <YieldFarmingModal open={openModal} handleOpen={open => setOpenModal(open)} />
    </TooltipContainer>
  );
};

export default YieldFarmingButton;
