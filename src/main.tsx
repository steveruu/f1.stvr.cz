import { createRoot } from 'react-dom/client'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
polyfillCountryFlagEmojis();