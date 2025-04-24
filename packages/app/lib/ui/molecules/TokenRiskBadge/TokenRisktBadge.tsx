import { Badge } from '@radix-ui/themes';

type Props = {
  risk: number;
};

const TokenRisktBadge = ({ risk }: Props) => {
  if (risk < 50) {
    return <Badge color="green">Low</Badge>;
  }
  if (risk < 150) {
    return <Badge color="orange">Moderate</Badge>;
  }
  return <Badge color="red">High</Badge>;
};

export default TokenRisktBadge;
