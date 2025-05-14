import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 👈 import necessário
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* 👈 envolve o App aqui */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
