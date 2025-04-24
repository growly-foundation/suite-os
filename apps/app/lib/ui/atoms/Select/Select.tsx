import { Select as BaseSelect } from '@radix-ui/themes';

interface Props {
  defaultValue?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}

const Select = ({ defaultValue, onValueChange, value, options }: Props) => {
  return (
    <BaseSelect.Root defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
      <BaseSelect.Trigger className="py-2 px-3 rounded-xl w-full" color="green" variant="soft" />
      <BaseSelect.Content>
        {options.map(option => (
          <BaseSelect.Item value={option.value}>{option.label}</BaseSelect.Item>
        ))}
      </BaseSelect.Content>
    </BaseSelect.Root>
  );
};

export default Select;
