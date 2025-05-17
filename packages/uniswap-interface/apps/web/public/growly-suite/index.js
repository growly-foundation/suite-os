// Simple widget bundle
(function () {
  window.GrowlySuite = window.GrowlySuite || {};

  window.GrowlySuite.SimpleWidget = {
    init: function (container, config) {
      config = config || {};
      const theme = config.theme || 'light';
      const position = config.position || 'bottom-right';

      // Create widget elements
      const widget = document.createElement('div');
      widget.className = 'growly-suite-widget';
      widget.style.position = 'fixed';
      widget.style.zIndex = '9999';

      // Set position
      switch (position) {
        case 'bottom-right':
          widget.style.bottom = '20px';
          widget.style.right = '20px';
          break;
        case 'bottom-left':
          widget.style.bottom = '20px';
          widget.style.left = '20px';
          break;
        case 'top-right':
          widget.style.top = '20px';
          widget.style.right = '20px';
          break;
        case 'top-left':
          widget.style.top = '20px';
          widget.style.left = '20px';
          break;
      }

      // Create toggle button
      const button = document.createElement('button');
      button.style.width = '50px';
      button.style.height = '50px';
      button.style.borderRadius = '50%';
      button.style.backgroundColor = theme === 'light' ? '#6366f1' : '#4f46e5';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.cursor = 'pointer';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      button.textContent = '?';

      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.style.position = 'absolute';
      chatWindow.style.bottom = '70px';
      chatWindow.style.right = '0';
      chatWindow.style.width = '300px';
      chatWindow.style.height = '400px';
      chatWindow.style.backgroundColor = theme === 'light' ? 'white' : '#1f2937';
      chatWindow.style.color = theme === 'light' ? '#1f2937' : 'white';
      chatWindow.style.borderRadius = '10px';
      chatWindow.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      chatWindow.style.display = 'none';
      chatWindow.style.flexDirection = 'column';
      chatWindow.style.overflow = 'hidden';

      // Create header
      const header = document.createElement('div');
      header.style.padding = '15px';
      header.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
      header.style.borderBottom = `1px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`;
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';

      const title = document.createElement('div');
      title.textContent = 'Growly Suite Widget';

      const closeButton = document.createElement('button');
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.cursor = 'pointer';
      closeButton.style.color = theme === 'light' ? '#4b5563' : '#d1d5db';
      closeButton.textContent = 'X';

      header.appendChild(title);
      header.appendChild(closeButton);

      // Create body
      const body = document.createElement('div');
      body.style.padding = '15px';
      body.style.flexGrow = '1';
      body.style.overflowY = 'auto';

      const p1 = document.createElement('p');
      p1.textContent = 'This is a simple widget from @growly/suite.';

      const p2 = document.createElement('p');
      p2.textContent = 'It can be customized and extended as needed.';

      body.appendChild(p1);
      body.appendChild(p2);

      // Create footer
      const footer = document.createElement('div');
      footer.style.padding = '10px 15px';
      footer.style.borderTop = `1px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`;
      footer.style.display = 'flex';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Type a message...';
      input.style.flexGrow = '1';
      input.style.padding = '8px 12px';
      input.style.border = `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`;
      input.style.borderRadius = '4px';
      input.style.backgroundColor = theme === 'light' ? 'white' : '#374151';
      input.style.color = theme === 'light' ? 'black' : 'white';

      footer.appendChild(input);

      // Assemble chat window
      chatWindow.appendChild(header);
      chatWindow.appendChild(body);
      chatWindow.appendChild(footer);

      // Assemble widget
      widget.appendChild(button);
      widget.appendChild(chatWindow);

      // Add event listeners
      button.addEventListener('click', function () {
        if (chatWindow.style.display === 'none') {
          chatWindow.style.display = 'flex';
          button.textContent = 'X';
        } else {
          chatWindow.style.display = 'none';
          button.textContent = '?';
        }
      });

      closeButton.addEventListener('click', function () {
        chatWindow.style.display = 'none';
        button.textContent = '?';
      });

      input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          alert('Message sent!');
          input.value = '';
        }
      });

      // Add to container
      container.appendChild(widget);

      return {
        unmount: function () {
          container.removeChild(widget);
        },
      };
    },
  };
})();
