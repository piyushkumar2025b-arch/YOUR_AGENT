import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SystemErrorBoundary } from './components/SystemErrorBoundary';
import { installGlobalFetchInterceptor } from './utils/apiAuth';
import './index.css';

// Ensure global session authorization and abort resilience
installGlobalFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemErrorBoundary fallbackTitle="Global System Safeguard Intercepted UI Exception">
      <App />
    </SystemErrorBoundary>
  </StrictMode>,
);
