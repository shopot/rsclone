import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './main.scss';

const rootElement = document.querySelector<HTMLDivElement>('#app');
if (!rootElement) {
  throw new Error('Root element #app was not found');
}
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
