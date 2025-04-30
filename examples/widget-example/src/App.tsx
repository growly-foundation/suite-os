import './App.css';
import { ChatWidget, Theme, WidgetConfigProvider } from '@growly/widget';

function App() {
  return (
    <WidgetConfigProvider
      config={{
        agent: {
          name: 'Test Agent',
          avatar: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
        },
        theme: Theme.monoTheme,
      }}>
      Hello
      <ChatWidget />
    </WidgetConfigProvider>
  );
}

export default App;
