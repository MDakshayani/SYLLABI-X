import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PremiumBackground from './components/PremiumBackground'
import ScrollToTop from './components/ScrollToTop'
import NeuralCursor from './components/NeuralCursor'

// Auth pages
import Login          from './pages/auth/Login'
import Signup         from './pages/auth/Signup'

// App pages
import HomePage        from './pages/HomePage'
import About           from './pages/About'
import Dashboard       from './pages/Dashboard'
import Generate        from './pages/Generate'
import FacultyDashboard from './pages/FacultyDashboard'
import StudentDashboard from './pages/StudentDashboard'
import CurriculumPreview from './pages/CurriculumPreview'
import SemesterView    from './pages/SemesterView'
import CourseDetail    from './pages/CourseDetail'
import UnitDetail      from './pages/UnitDetail'
import PDFPreview      from './pages/PDFPreview'
import History         from './pages/History'
import Templates       from './pages/Templates'
import Settings        from './pages/Settings'
import Profile         from './pages/Profile'
import SyllabiXCopilot from './components/SyllabiXCopilot'

export default function App() {
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('curriculum-ai-theme') || 'system'
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (systemDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      const savedTheme = localStorage.getItem('curriculum-ai-theme') || 'system'
      if (savedTheme === 'system') {
        applyTheme()
      }
    }

    applyTheme()
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    window.addEventListener('theme-changed', applyTheme)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      window.removeEventListener('theme-changed', applyTheme)
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      <PremiumBackground />
      <NeuralCursor />
      <SyllabiXCopilot />
      <Routes>
      {/* Public auth and informational routes */}
      <Route path="/login"           element={<Login />} />
      <Route path="/signup"          element={<Signup />} />
      <Route path="/about"           element={<About />} />

      {/* Root path mapping directly to HomePage (public landing page) */}
      <Route path="/" element={<HomePage />} />

      {/* Redirect /home to root */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* Protected app routes (with sidebar Layout) */}
      <Route element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route path="/dashboard"               element={<Dashboard />} />
        <Route path="/generate"                element={<Generate />} />
        <Route path="/faculty"                 element={<FacultyDashboard />} />
        <Route path="/student"                 element={<StudentDashboard />} />
        <Route path="/curriculum"              element={<CurriculumPreview />} />
        <Route path="/curriculum/semester/:id" element={<SemesterView />} />
        <Route path="/curriculum/semester/:semId/unit/:unitId" element={<UnitDetail />} />
        <Route path="/curriculum/course/:id"   element={<CourseDetail />} />
        <Route path="/curriculum/pdf"          element={<PDFPreview />} />
        <Route path="/history"                 element={<History />} />
        <Route path="/templates"               element={<Templates />} />
        <Route path="/settings"                element={<Settings />} />
        <Route path="/profile"                 element={<Profile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
