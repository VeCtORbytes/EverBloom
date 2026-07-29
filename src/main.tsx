import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSigilTemplates } from '@/engine/sigils/templates';
import { SIGIL_TEMPLATES } from '@/content/sigils';

// Boot registration of default sigil templates (§5.4 Registry pattern)
registerSigilTemplates(Object.values(SIGIL_TEMPLATES));

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
