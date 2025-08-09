import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
<<<<<<< HEAD
=======
import { integrationService } from './services/integrationService'

// Initialize all services and integrations
integrationService.init().catch(error => {
  console.error('Failed to initialize application services:', error)
})
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
