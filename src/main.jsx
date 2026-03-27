import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy load: cada rota carrega seu próprio CSS sem conflito
const App = lazy(() => import('./App.jsx'))
const CardapioPage = lazy(() => import('./components/CardapioPage.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/cardapio" element={<CardapioPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
