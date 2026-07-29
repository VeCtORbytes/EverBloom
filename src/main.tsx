import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSigilTemplates } from '@/engine/sigils/templates';
import { SIGIL_TEMPLATES } from '@/content/sigils';
import { registerSoundCues } from '@/engine/audio/cues';
import { AUDIO_MANIFEST } from '@/content/audio.manifest';

// Boot registration of default sigil templates & audio cues (§5.4 Registry pattern)
registerSigilTemplates(Object.values(SIGIL_TEMPLATES));
registerSoundCues(Object.values(AUDIO_MANIFEST));

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
