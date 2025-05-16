# Growly Suite Widget Integration with Uniswap Interface

This repository contains an integration of the @growly/suite widget with the Uniswap web interface. This allows you to embed the Growly Suite widget directly into the Uniswap interface for dogfooding and testing purposes.

## Overview

The integration adds the Growly Suite widget to the Uniswap web interface. The widget is loaded dynamically and appears in the bottom-right corner of the interface.

## Setup

1. Clone this repository:

   ```
   git clone https://github.com/your-username/growly-uniswap-integration.git
   cd growly-uniswap-integration
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Build the simple widget and start the Uniswap web app:
   ```
   pnpm build:uniswap
   ```

This will:

- Build a simple version of the @growly/suite widget
- Copy the widget files to the Uniswap web app's public directory
- Start the Uniswap web app with the widget integrated

## How It Works

The integration consists of the following components:

1. **GrowlySuiteWidget Component**: A React component that renders a container for the widget and loads the widget script.

   - Located at: `packages/uniswap-interface/apps/web/src/components/GrowlySuiteWidget/index.tsx`

2. **Widget Loader Script**: A script that dynamically loads the widget script and CSS.

   - Located at: `packages/uniswap-interface/apps/web/src/components/GrowlySuiteWidget/loadWidget.ts`

3. **Simple Widget Implementation**: A vanilla JavaScript implementation of the widget that doesn't depend on React.

   - Located at: `scripts/build-simple-widget.js`

4. **Integration with Uniswap**: The widget is added to the Uniswap interface by modifying the `AppLayout` component.
   - Located at: `packages/uniswap-interface/apps/web/src/pages/App/Layout.tsx`

## Customization

You can customize the widget by modifying the configuration in the `loadWidget.ts` file and the widget implementation in `build-simple-widget.js`. The widget supports various configuration options such as theme and position.

## Development

To make changes to the widget:

1. Modify the widget code in the `scripts/build-simple-widget.js` file
2. Rebuild the widget:
   ```
   pnpm build:simple-widget
   ```
3. Restart the Uniswap web app if it's already running

## Troubleshooting

If you encounter any issues:

1. Make sure the widget files are copied to `packages/uniswap-interface/apps/web/public/growly-suite`
2. Check the browser console for any errors
3. Verify that the GrowlySuiteWidget component is properly added to the AppLayout

## Future Improvements

Once the build issues with the full @growly/suite package are resolved, you can replace the simple widget implementation with the full-featured widget by:

1. Fixing the build issues in the @growly/suite package
2. Updating the `copy-growly-widget.js` script to copy the built files
3. Updating the `loadWidget.ts` file to use the full-featured widget

## License

This integration is licensed under the MIT License.
