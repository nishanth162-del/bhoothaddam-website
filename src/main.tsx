import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@astryxdesign/core/theme'
import { themes, defaultThemeSlug } from './astryx-themes'
import './index.css'
import App from './App.tsx'

type Mode = 'system' | 'light' | 'dark'

function Root() {
  // Dark-first: the redesign is built for dark; light is one tap away.
  const [mode, setMode] = useState<Mode>('dark')
  return (
    <Theme theme={themes[defaultThemeSlug]} mode={mode}>
      <App
        mode={mode}
        onToggleMode={() =>
          setMode((m) => (m === 'dark' ? 'light' : 'dark'))
        }
      />
    </Theme>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
