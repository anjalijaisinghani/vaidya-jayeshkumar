import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import ProfileProvider from './context/ProfileProvider.jsx'
import SiteLayout from './components/layout/SiteLayout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Articles from './pages/Articles.jsx'
import ArticleDetail from './pages/ArticleDetail.jsx'
import Treatments from './pages/Treatments.jsx'
import AyurvedicPoints from './pages/AyurvedicPoints.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Disclaimer from './pages/Disclaimer.jsx'
import NotFound from './pages/NotFound.jsx'

// The admin panel is loaded only when someone opens /admin, so ordinary visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

// The design preview page exists in development only; it is left out of the live website.
const StyleGuide = import.meta.env.DEV ? lazy(() => import('./pages/StyleGuide.jsx')) : null

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:slug" element={<ArticleDetail />} />
            <Route path="treatments" element={<Treatments />} />
            <Route path="ayurvedic-points" element={<AyurvedicPoints />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="disclaimer" element={<Disclaimer />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="admin/*"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center" role="status">
                    <span className="spinner" aria-hidden="true" />
                    <span className="sr-only">Loading...</span>
                  </div>
                }
              >
                <AdminApp />
              </Suspense>
            }
          />
          {StyleGuide && (
            <Route
              path="/style-guide"
              element={
                <Suspense fallback={null}>
                  <StyleGuide />
                </Suspense>
              }
            />
          )}
        </Routes>
      </ProfileProvider>
    </BrowserRouter>
  )
}