'use client';

import React, { useEffect, useState } from 'react';
import { Input } from './components/ui/input';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Theme, useWidget } from 'lib/main';

export function Controls() {
  const { setConfig } = useWidget();
  const [agent, setAgent] = useState({
    name: 'Growly Copilot',
    avatar: '/logos/growly-contrast.png',
  });
  const [theme, setTheme] = useState(Theme.monoTheme);

  useEffect(() => {
    setConfig({
      theme,
      agent,
    });
  }, [theme, agent]);

  return (
    <React.Fragment>
      <Tabs defaultValue="monoTheme">
        <TabsList>
          <TabsTrigger onClick={() => setTheme(Theme.monoTheme)} value="monoTheme">
            Mono theme
          </TabsTrigger>
          <TabsTrigger onClick={() => setTheme(Theme.defaultTheme)} value="defaultTheme">
            Default theme
          </TabsTrigger>
          <TabsTrigger onClick={() => setTheme(Theme.defaultDarkTheme)} value="defaultDarkTheme">
            Default dark theme
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Input
        type="text"
        placeholder="Agent name"
        value={agent.name}
        onChange={e => setAgent({ ...agent, name: e.target.value })}
      />
      <Input
        type="text"
        placeholder="Agent avatar URL"
        value={agent.avatar}
        onChange={e => setAgent({ ...agent, avatar: e.target.value })}
      />
    </React.Fragment>
  );
}
