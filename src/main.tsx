import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { ProfileProvider } from '@/store/profile';
import { NavProvider } from '@/store/navigation';
import '@/index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Élément #root introuvable dans index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <ProfileProvider>
      <NavProvider>
        <App />
      </NavProvider>
    </ProfileProvider>
  </StrictMode>,
);
