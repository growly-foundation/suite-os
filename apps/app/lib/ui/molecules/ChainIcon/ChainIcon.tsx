import { EvmApiService } from '@/core';
import { TChainMetadataListResponse, TChainName } from 'chainsmith-sdk/types';
import { getChainByName } from 'chainsmith-sdk/utils';
import { useState, useEffect } from 'react';
import { Avatar } from '@radix-ui/themes';

const ChainIcon = ({ chainName, size }: { chainName: TChainName; size?: number }) => {
  const [metadata, setMetadata] = useState<TChainMetadataListResponse | undefined>();

  useEffect(() => {
    const fetchChainMetadata = async () => {
      try {
        const _metadata = await new EvmApiService().getChainMetadataById(
          getChainByName(chainName).id
        );
        setMetadata(_metadata);
      } catch (error) {
        console.log(error);
      }
    };
    fetchChainMetadata();
  }, [chainName]);

  return (
    <Avatar
      src={metadata?.logoUrl || ''}
      alt={`${chainName.slice(1)}`}
      style={{
        objectFit: 'contain',
        width: size || 30,
        height: size || 30,
      }}
      fallback={chainName.slice(0, 2)}
      className="inline-block rounded-full overflow-hidden"
    />
  );
};

export default ChainIcon;
