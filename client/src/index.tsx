import App from './app';
import React from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.querySelector<HTMLDivElement>('#app');

if (!rootElement) {
  throw new Error('Root element #app was not found');
}

const root = createRoot(rootElement);

root.render(<App />);
