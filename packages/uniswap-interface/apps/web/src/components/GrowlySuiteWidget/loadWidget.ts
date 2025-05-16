// This script dynamically loads the @growly/suite widget

export function loadGrowlySuiteWidget() {
  // Check if the script is already loaded
  if (document.getElementById('growly-suite-widget-script')) {
    return
  }

  // Create a link element for the CSS
  const linkElement = document.createElement('link')
  linkElement.rel = 'stylesheet'
  linkElement.href = '/growly-suite/styles.css' // Path where you'll serve the CSS from
  linkElement.id = 'growly-suite-widget-styles'
  document.head.appendChild(linkElement)

  // Create a script element
  const script = document.createElement('script')
  script.src = '/growly-suite/index.js' // Path where you'll serve the JS from
  script.id = 'growly-suite-widget-script'
  script.async = true
  script.onload = () => {
    // Initialize the widget once the script is loaded
    if (window.GrowlySuite && window.GrowlySuite.SimpleWidget) {
      const container = document.getElementById('growly-suite-widget-container')
      if (container) {
        window.GrowlySuite.SimpleWidget.init(container, {
          // Add your widget configuration here
          theme: 'light',
          position: 'bottom-right',
        })
      }
    }
  }

  // Append the script to the document
  document.body.appendChild(script)
}

// Add a type declaration for the GrowlySuite global object
declare global {
  interface Window {
    GrowlySuite?: {
      SimpleWidget: {
        init: (container: HTMLElement, config?: any) => void
      }
      widgets?: {
        ChatWidget?: {
          init: (config: any) => void
        }
        StaticWidget?: {
          init: (config: any) => void
        }
      }
    }
  }
}
