import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Home, Info, Sparkles } from 'lucide-react'
import useAuthStore from '../store/authStore'
import UserAvatar from './UserAvatar'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore(s => s.user)

  const isHome = location.pathname === '/'
  const isAbout = location.pathname === '/about'

  const handleHomeClick = () => {
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAboutClick = () => {
    navigate('/about')
  }

  const handleGetStartedClick = () => {
    navigate('/generate')
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass border-b border-white/60"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo (SyllabiX) */}
        <div 
          onClick={handleHomeClick}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg animate-pulse-subtle">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-text-primary text-sm leading-none">SyllabiX</p>
            <p className="text-[10px] text-text-secondary leading-none mt-0.5 font-medium">AI Learning Platform</p>
          </div>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button 
            onClick={handleHomeClick}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              isHome 
                ? 'text-primary font-semibold' 
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            <Home size={14} /> Home
          </button>
          <button 
            onClick={handleAboutClick}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAbout 
                ? 'text-primary font-semibold' 
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            <Info size={14} /> About
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGetStartedClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2 gradient-bg text-white text-xs font-semibold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Sparkles size={13} /> Get Started
          </button>

          {/* Avatar */}
          {user ? (
            <button 
              onClick={() => navigate('/profile')}
              className="hover:ring-primary/40 transition-all rounded-full cursor-pointer focus:outline-none"
            >
              <UserAvatar user={user} size="md" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-text-secondary hover:text-primary text-xs font-semibold px-4 py-2 hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
