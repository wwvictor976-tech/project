import "./styles/global.css";
import "./styles/tailwind.css";
import "./styles/typography.css";
import "./styles/scrollbar.css";
import "./styles/animations.css";
import "./styles/utilities.css";

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
