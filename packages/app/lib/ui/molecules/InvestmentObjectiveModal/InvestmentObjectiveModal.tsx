import { useState } from 'react';
import { Modal, Button } from '../../atoms';
import clsx from 'clsx';
import { storeJsonCacheData, buildCachePayload, INVESTMENT_OBJECTIVES } from '@/core';
import { useAccount } from 'wagmi';

type Props = {
  open: boolean;
  handleOpen: (open: boolean) => void;
};

const InvestmentObjectiveModal = ({ open, handleOpen }: Props) => {
  const { address } = useAccount();
  const [steps, setSteps] = useState(0);
  const [stepValues, setStepValues] = useState({
    0: 'Daily',
    1: 'Conservative',
    2: 'Maximize Growth',
  });
  return (
    <Modal open={open} handleOpen={handleOpen}>
      <div className="bg-white">
        {steps === 0 && (
          <div className="items-center flex flex-col">
            <h1 className="font-bold text-xl">How often do you look at your portfolio?</h1>
            <p>You can always change this later</p>
            <div className="flex gap-3 mt-7">
              {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(value => (
                <Button
                  className={clsx(
                    'rounded-3xl py-1 px-4',
                    stepValues[steps] === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black hover:bg-blue-400 hover:text-white'
                  )}
                  onClick={() =>
                    setStepValues({
                      ...stepValues,
                      [steps]: value,
                    })
                  }
                  value={value}>
                  {value}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setSteps(steps + 1)}
              className="mt-5 bg-orange-200 hover:bg-orange-600 hover:text-white rounded-xl w-full">
              Continue
            </Button>
          </div>
        )}
        {steps === 1 && (
          <div className="items-center flex flex-col">
            <h1 className="font-bold text-xl">What is your risk preference?</h1>
            <p>You can always change this later</p>
            <div className="flex gap-3 mt-7 flex-col">
              {[
                { title: 'Conservative', subtitle: '~10% loss in downturn' },
                { title: 'Moderately Conservative', subtitle: '~20% loss in downturn' },
                { title: 'Moderately Aggressive', subtitle: '~30% loss in downturn' },
                { title: 'Aggressive', subtitle: '~40% loss in downturn' },
                { title: 'Very Aggressive', subtitle: '~50% loss in downturn' },
              ].map(value => (
                <Button
                  className={clsx(
                    'rounded-3xl py-1 px-4',
                    stepValues[steps] === value.title
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black hover:bg-blue-400 hover:text-white'
                  )}
                  onClick={() =>
                    setStepValues({
                      ...stepValues,
                      [steps]: value.title,
                    })
                  }
                  value={value.title}>
                  {value.title} - {value.subtitle}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setSteps(steps + 1)}
              className="mt-5 bg-orange-200 hover:bg-orange-600 hover:text-white rounded-xl w-full">
              Continue
            </Button>
          </div>
        )}
        {steps === 2 && (
          <div className="items-center flex flex-col">
            <h1 className="font-bold text-xl">What is your primary investment objective?</h1>
            <p>You can always change this later</p>
            <div className="flex gap-3 mt-7 flex-col">
              {[
                { title: 'Maximize Growth', subtitle: 'Focus on total returns' },
                { title: 'Balance Growth & Income', subtitle: '~20% loss in downturn' },
                { title: 'Maximize Income', subtitle: 'Increase dividends & interest payouts' },
              ].map(value => (
                <Button
                  className={clsx(
                    'rounded-3xl py-1 px-4',
                    stepValues[steps] === value.title
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black hover:bg-blue-400 hover:text-white'
                  )}
                  onClick={() =>
                    setStepValues({
                      ...stepValues,
                      [steps]: value.title,
                    })
                  }
                  value={value.title}>
                  {value.title} - {value.subtitle}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => {
                handleOpen(false);
                const [key, expiration] = INVESTMENT_OBJECTIVES(address);
                storeJsonCacheData(key, buildCachePayload(stepValues, expiration));
              }}
              className="mt-5 bg-orange-200 hover:bg-orange-600 hover:text-white rounded-xl w-full">
              Submit Investment Objectives
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default InvestmentObjectiveModal;
