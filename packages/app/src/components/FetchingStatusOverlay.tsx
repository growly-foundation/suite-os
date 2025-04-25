'use client';
import ReactModal from 'react-modal';
import { MIDDLE_STYLE, useBreakpoint, useMultichainMagic } from '../../lib/core/hooks';
import { ThreeStageState } from '../../lib/core/types';
import LoadingGif from '../assets/loading.gif';

const FetchingStatusOverlay = () => {
  const {
    query: { stateCheck },
  } = useMultichainMagic();
  const { isTablet } = useBreakpoint();
  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={stateCheck('GetMultichainData', ThreeStageState.InProgress)}
      style={{
        content: {
          background: 'none',
          border: 'none',
        },
      }}>
      <div style={{ ...MIDDLE_STYLE, flexDirection: 'column' }} className="flex flex-col mt-[50px]">
        <div style={{ fontSize: 150 }}>
          <img src={LoadingGif} />
        </div>
        <h2
          className="font-bold"
          style={{
            fontSize: isTablet ? 25 : 40,
            margin: 0,
          }}>
          {stateCheck('ActivityStats', ThreeStageState.InProgress) && 'Fetching activity stats'}
          {stateCheck('GetTokenActivity', ThreeStageState.InProgress) &&
            'Get your token activities'}
          {stateCheck('GetTokenPortfolio', ThreeStageState.InProgress) &&
            'Get your token portfolio'}
          {stateCheck('GetNftActivity', ThreeStageState.InProgress) && 'Get your NFT activities'}
          {stateCheck('GetNftPortfolio', ThreeStageState.InProgress) && 'Get your NFT portfolio'}
        </h2>
        <p
          style={{
            fontSize: isTablet ? 15 : 20,
            textAlign: 'center',
            margin: 0,
          }}>
          {stateCheck('ActivityStats', ThreeStageState.InProgress) &&
            'Collecting and analyzing your onchain activity...'}
          {stateCheck('GetTokenActivity', ThreeStageState.InProgress) &&
            'Searching for your token-related transactions...'}
          {stateCheck('GetTokenPortfolio', ThreeStageState.InProgress) &&
            'Analysing your multi-chain token portfolio...'}
          {stateCheck('GetNftActivity', ThreeStageState.InProgress) &&
            'Searching for your NFT-related transactions...'}
          {stateCheck('GetNftPortfolio', ThreeStageState.InProgress) &&
            'Analysing your multi-chain NFT portfolio...'}
        </p>
      </div>
    </ReactModal>
  );
};

export default FetchingStatusOverlay;
