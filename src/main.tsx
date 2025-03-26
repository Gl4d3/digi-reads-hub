
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupPrefetching } from './utils/prefetchData'

// Initialize prefetching
setupPrefetching();

createRoot(document.getElementById("root")!).render(<App />);
