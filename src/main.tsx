import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SystemErrorBoundary } from './components/SystemErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemErrorBoundary fallbackTitle="Global System Safeguard Intercepted UI Exception">
      <App />
    </SystemErrorBoundary>
  </StrictMode>,
);
