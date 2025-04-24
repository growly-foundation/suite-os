import 'reflect-metadata';
import '@radix-ui/themes/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

import { Theme } from '@radix-ui/themes';
import { BrowserRouter, Route, Routes } from 'react-router';
import Providers from './Providers';
import { GettingStarted, Chat } from './screens';
import { AnimatedBackground } from './components/AnimatedBackground';
import FetchingStatusOverlay from './components/FetchingStatusOverlay';
import { AppBar } from './components/AppBar';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Providers>
      <Theme grayColor="gray" radius="large">
        <main className={`w-full max-h-[100vh]`}>
          <FetchingStatusOverlay />
          <AnimatedBackground />
          <div className="px-3 py-5">
            <AppBar />
            <div className="h-full relative flex flex-col items-center">
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<GettingStarted />} />
                  <Route path="chat/:agentId" element={<Chat />} />
                </Routes>
              </BrowserRouter>
            </div>
          </div>
          <ToastContainer />
        </main>
      </Theme>
    </Providers>
  );
}

export default App;
