import { Toaster } from '@/components/ui/toaster';
import { OpenContext } from '@/contexts/layout';
import React from 'react';
import { Card } from '../ui/card';

interface Props {
  children: React.ReactNode;
}

const WidgetStudioLayout: React.FC<Props> = (props: Props) => {
  const [open, setOpen] = React.useState(false);

  return (
    <OpenContext.Provider value={{ open, setOpen }}>
      <div className="dark:bg-background-900 flex h-[100%] w-full bg-white">
        <Toaster />
        <div
          className={`lg:!z-99 fixed !z-[99] w-[300px] transition-all md:!z-[99] xl:!z-0 
       xl:block`}>
          <Card
            className={`m-3 ml-3 h-[100%] px-5 py-5 w-full overflow-hidden !rounded-lg border-zinc-200 pe-4 dark:border-zinc-800 sm:my-4 sm:mr-4 md:m-5 md:mr-[-50px]`}>
            <div className="text-zinc-950 dark:text-white">Hello</div>
          </Card>
        </div>
        <div className="h-[100%] w-full dark:bg-zinc-950">
          <main
            className={`mx-2.5 flex-none transition-all dark:bg-zinc-950 md:pr-2 xl:ml-[328px]`}>
            <div className="mx-auto p-2 !pt-[90px] md:p-2 md:!pt-[118px]">{props.children}</div>
          </main>
        </div>
      </div>
    </OpenContext.Provider>
  );
};

export default WidgetStudioLayout;
