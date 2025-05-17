import React, { useEffect } from 'react';
import styled from 'styled-components';
import { loadGrowlySuiteWidget } from './loadWidget';

// This component will host the Growly Suite widget
const WidgetContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

export function GrowlySuiteWidget() {
  useEffect(() => {
    // Load the widget when the component mounts
    loadGrowlySuiteWidget();

    // No cleanup needed as we want the widget to persist
  }, []);

  return (
    <WidgetContainer id="growly-suite-widget-container">
      {/* The Growly Suite widget will be mounted here */}
    </WidgetContainer>
  );
}
