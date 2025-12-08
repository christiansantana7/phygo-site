import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PhygoLuxury from './PhygoSite'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhygoLuxury />
  </StrictMode>,
)

