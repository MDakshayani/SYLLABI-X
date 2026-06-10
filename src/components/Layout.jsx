import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Sparkles, History, GraduationCap, LogOut, ShieldAlert
} from 'lucide-react'
import { cn } from '../lib/utils'
import useAuthStore from '../store/authStore'
import UserAvatar from './UserAvatar'

import NavigationHeader from './NavigationHeader'

export default function Layout() {
  const navigate  = useNavigate()
  const user      = useAuthStore(s => s.user)
  const logout    = useAuthStore(s => s.logout)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative z-10 text-text-primary bg-transparent">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-navbar/75 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm transition-colors">
        
        {/* Left: Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8.5 h-8.5 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-text-primary text-sm leading-none">SyllabiX</p>
            <p className="text-[9px] text-text-secondary leading-none mt-0.5 font-medium">AI Learning Platform</p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-4 text-sm font-medium">
          <NavLink
            to="/generate"
            className={({ isActive }) => cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-secondary hover:bg-primary/8 hover:text-primary dark:hover:text-primary'
            )}
          >
            <Sparkles size={12} />
            <span>Generate</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-secondary hover:bg-primary/8 hover:text-primary dark:hover:text-primary'
            )}
          >
            <History size={12} />
            <span>History</span>
          </NavLink>
        </nav>

        {/* Right: User profile details & Logout */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-primary/8 transition-colors cursor-pointer"
          >
            <UserAvatar user={user} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-text-primary leading-tight">{user?.name}</p>
              <p className="text-[9px] text-text-secondary mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            title="Sign out"
            className="text-text-secondary hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-transparent">
        <NavigationHeader />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={22} />
              </div>
              <h3 className="text-base font-extrabold text-text-primary mb-2">Confirm Logout</h3>
              <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-xs font-semibold text-text-secondary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-md hover:bg-red-600 transition-colors text-xs cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
