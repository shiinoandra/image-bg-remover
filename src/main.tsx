import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './BGRemoverPro.css';

import App from './App.tsx'
import BGRemoverPro from './BGRemover.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BGRemoverPro />
  </StrictMode>,
)
