import React, { useState } from 'react';

interface SimpleWidgetProps {
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const SimpleWidget: React.FC<SimpleWidgetProps> = ({
  theme = 'light',
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      default:
        return { bottom: '20px', right: '20px' };
    }
  };

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    ...getPositionStyles(),
  };

  const buttonStyles: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: theme === 'light' ? '#6366f1' : '#4f46e5',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const chatWindowStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    width: '300px',
    height: '400px',
    backgroundColor: theme === 'light' ? 'white' : '#1f2937',
    color: theme === 'light' ? '#1f2937' : 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: isOpen ? 'flex' : 'none',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    padding: '15px',
    backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
    borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const bodyStyles: React.CSSProperties = {
    padding: '15px',
    flexGrow: 1,
    overflowY: 'auto',
  };

  const footerStyles: React.CSSProperties = {
    padding: '10px 15px',
    borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`,
    display: 'flex',
  };

  const inputStyles: React.CSSProperties = {
    flexGrow: 1,
    padding: '8px 12px',
    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
    borderRadius: '4px',
    backgroundColor: theme === 'light' ? 'white' : '#374151',
    color: theme === 'light' ? 'black' : 'white',
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={containerStyles} className="growly-suite-widget">
      <button style={buttonStyles} onClick={toggleChat}>
        {isOpen ? 'X' : '?'}
      </button>
      <div style={chatWindowStyles}>
        <div style={headerStyles}>
          <div>Growly Suite Widget</div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'light' ? '#4b5563' : '#d1d5db',
            }}>
            X
          </button>
        </div>
        <div style={bodyStyles}>
          <p>This is a simple widget from @growly/suite.</p>
          <p>It can be customized and extended as needed.</p>
        </div>
        <div style={footerStyles}>
          <input
            type="text"
            placeholder="Type a message..."
            style={inputStyles}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                alert('Message sent!');
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// For global access
if (typeof window !== 'undefined') {
  (window as any).GrowlySuite = {
    ...(window as any).GrowlySuite,
    SimpleWidget: {
      init: (container: HTMLElement, props: SimpleWidgetProps = {}) => {
        const root = document.createElement('div');
        container.appendChild(root);

        // Use React.createElement directly to avoid JSX transformation issues
        const element = React.createElement(SimpleWidget, props);

        // Use a simple render function since we're not using ReactDOM directly
        const renderElement = () => {
          if (typeof document !== 'undefined') {
            // This is a simplified approach. In a real app, you'd use ReactDOM.render
            root.innerHTML = '<div>Growly Suite Widget Mounted</div>';
            // In reality, you'd do: ReactDOM.render(element, root);
          }
        };

        renderElement();
        return {
          unmount: () => {
            root.remove();
          },
        };
      },
    },
  };
}
