import { TAddress } from 'chainsmith-sdk/types';
import { Avatar, Button } from '../../atoms';
import { ButtonProps } from '@radix-ui/themes';
import { ChevronDownIcon } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  address: TAddress;
  highlighted?: boolean;
  truncatedLength?: number;
  truncated?: boolean;
  className?: string;
} & ButtonProps;

export default ({
  address,
  highlighted,
  truncated,
  truncatedLength = 4,
  className,
  ...props
}: Props) => {
  const first = address.slice(0, truncatedLength / 2);
  const second = address.slice(address.length - truncatedLength / 2);
  return (
    <Button
      {...props}
      data-popover-target="popover-default"
      style={{ textTransform: 'lowercase' }}
      className={clsx(
        `hover:bg-gray-200 flex items-center cursor-pointer gap-3 py-2 px-3 rounded-xl`,
        className,
        highlighted ? 'bg-gray-200' : 'bg-white',
        !highlighted && `text-black`
      )}>
      <Avatar address={address} size={50} />
      {truncated && first.length < address.length / 2 && truncatedLength > 0
        ? `${first}...${second}`
        : address}
      {props.onClick && <ChevronDownIcon />}
    </Button>
  );
};
