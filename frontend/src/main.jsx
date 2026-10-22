import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import '@fontsource-variable/inter'
import '@fontsource-variable/lora'
import './index.css'
import App from './App.jsx'

// A "data router" is used instead of <BrowserRouter> because only it can warn before leaving a page
// that holds unsaved work. All the routes are still declared inside App.jsx.
const router = createBrowserRouter([{ path: '*', element: <App /> }])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)