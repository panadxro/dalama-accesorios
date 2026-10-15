import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { Toaster } from './components/ui/Toast';
import { TooltipProvider } from './components/ui/Menu';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <Toaster />
    </TooltipProvider>
  </StrictMode>,
);
