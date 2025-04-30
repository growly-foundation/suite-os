'use client';
import { AppContext } from '@/components/AppProvider';
import { getShareableUrl } from '@/lib/url-params';
import { cn } from '@/lib/utils';
import { AppStackComponent } from '@/types/appstack';
import { useContext, useEffect, useState } from 'react';
import DemoOptions from './DemoOptions';
import ChatWidgetDemo from './demo/ChatWidget';

const activeComponentMapping: Record<AppStackComponent, React.FC> = {
  [AppStackComponent.ChatWidget]: ChatWidgetDemo,
  [AppStackComponent.DemoChatWidget]: ChatWidgetDemo,
  [AppStackComponent.StaticWidget]: ChatWidgetDemo,
};

export default function Demo() {
  const { activeComponent } = useContext(AppContext);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sideBarVisible, setSideBarVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyShareableLink = () => {
    const url = getShareableUrl(activeComponent);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    console.log('Playground.activeComponent:', activeComponent);
  }, [activeComponent]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setSideBarVisible(visible => !visible);
  };

  const buttonStyles = `rounded border px-3 py-2 transition-colors ${
    isDarkMode
      ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700'
      : 'border-gray-300 bg-white text-black hover:bg-gray-100'
  }`;

  const ActiveComponent = activeComponent ? activeComponentMapping[activeComponent] : null;

  return (
    <>
      <div
        className={cn(
          'absolute top-0 right-0 bottom-0 left-0 z-20 flex w-full min-w-80 flex-col border-r bg-background p-6 transition-[height] sm:static sm:z-0 sm:w-1/4',
          sideBarVisible ? 'h-full min-h-screen' : 'h-20 overflow-hidden'
        )}>
        <div className="mb-12 flex justify-between">
          <div className="self-center font-semibold text-xl">Growly AppStack Playground</div>
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              buttonStyles,
              'px-1 transition-transform sm:hidden',
              sideBarVisible ? '-rotate-90' : 'rotate-90'
            )}>
            <span className="pl-2">&rang;</span>
          </button>
        </div>
        <button type="button" onClick={toggleDarkMode} className={buttonStyles}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <form className="mt-4 grid gap-8">
          <DemoOptions component={activeComponent} />
        </form>
        <div className="mt-auto flex items-center justify-between pt-6 text-sm">
          <div>
            <a
              className="opacity-100 transition-opacity duration-200 hover:opacity-70"
              href="https://github.com/growly-official/appstack"
              rel="noreferrer"
              target="_blank"
              title="View AppStack on GitHub">
              Github ↗
            </a>
            <a
              className="pl-4 opacity-100 transition-opacity duration-200 hover:opacity-70"
              href="https://getgrowly.xyz"
              rel="noreferrer"
              target="_blank"
              title="View Growly AppStack">
              Growly AppStack↗
            </a>
          </div>

          <button
            type="button"
            onClick={copyShareableLink}
            className="opacity-100 transition-opacity duration-200 hover:opacity-70">
            {copied ? 'Copied!' : 'Share ↗'}
          </button>
        </div>
      </div>
    </>
  );
}
