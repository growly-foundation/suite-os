import { Select } from 'radix-ui';
import React from 'react';
import classnames from 'classnames';
import { CheckIcon } from '@radix-ui/react-icons';

interface Props {
  className?: string;
  value: string;
  children: React.ReactNode | string;
}

const SelectItem: React.FC<Props> = ({ className, children, value, ...props }) => {
  return (
    <Select.Item value={value} className={classnames('SelectItem', className)} {...props}>
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
};

export default SelectItem;
