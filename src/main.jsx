import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const App = lazy(() => import('./App.jsx'))
const CardapioLayout = lazy(() => import('./components/CardapioLayout.jsx'))
const AdminPanel = lazy(() => import('./components/AdminPanel.jsx'))

const cardapioTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffc107', contrastText: '#000' },
    secondary: { main: '#e53935' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#fff', secondary: '#ddd' },
  },
  typography: {
    fontFamily: ['"Comfortaa"', 'sans-serif'].join(','),
    h1: { fontFamily: '"Alfa Slab One"', fontWeight: 400, fontSize: '3rem' },
    h2: { fontFamily: '"Alfa Slab One"', fontWeight: 400, fontSize: '2.5rem' },
    h3: { fontFamily: '"Alfa Slab One"', fontWeight: 400, fontSize: '2rem' },
    h4: { fontFamily: '"Alfa Slab One"', fontWeight: 400, fontSize: '1.75rem' },
    h5: { fontFamily: '"Alfa Slab One"', fontWeight: 400, fontSize: '1.5rem' },
    h6: { fontFamily: '"Alfa Slab One"', fontWeight: 400, fontSize: '1.25rem' },
    button: { fontFamily: ['"Comfortaa"', 'sans-serif'].join(','), fontWeight: 700, textTransform: 'none' },
    body1: { fontFamily: ['"Comfortaa"', 'sans-serif'].join(',') },
    body2: { fontFamily: ['"Comfortaa"', 'sans-serif'].join(',') },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiAppBar: { styleOverrides: { colorPrimary: { backgroundColor: '#000' } } },
  },
})

function CardapioWrapper() {
  return (
    <ThemeProvider theme={cardapioTheme}>
      <CssBaseline />
      <CardapioLayout />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/cardapio" element={<CardapioWrapper />} />
          <Route path="/admin" element={<Suspense fallback={null}><AdminPanel /></Suspense>} />
          <Route path="/*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
