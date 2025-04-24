import { Fragment, ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

type Props = {
  children?: ReactNode;
  tooltipId: string;
  tooltipContent: string;
};

const TooltipContainer = ({ children, tooltipId, tooltipContent }: Props) => {
  return (
    <Fragment>
      <div
        className="w-fit hover:cursor-pointer"
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltipContent}>
        {children}
      </div>
      <Tooltip id={tooltipId} />
    </Fragment>
  );
};

export default TooltipContainer;
