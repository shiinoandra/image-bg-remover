import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './BGRemoverPro.css';

import App from './App.tsx'
import BGRemoverPro from './BGremover.tsx'

const CenteredContainer = ({ children }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%'
  }}>
    {children}
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CenteredContainer>
      <BGRemoverPro />
    </CenteredContainer>
  </StrictMode>,
)