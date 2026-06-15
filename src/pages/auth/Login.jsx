import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion as motionFramer } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, Loader2, GraduationCap,
  Sparkles, BookOpen, ArrowRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useGoogleAuth } from '../../hooks/useGoogleAuth'
import { cn } from '../../lib/utils'
import PageTransition from '../../components/PageTransition'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const floatAnimation = (delay) => ({
  animate: {
    y: [0, -12, 0],
  },
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut",
    delay: delay,
  }
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error, clearError, isAuthenticated } = useAuthStore()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [remember,  setRemember]  = useState(false)
  const [fieldErrs, setFieldErrs] = useState({})

  const from = location.state?.from?.pathname || '/'

  // Real Firebase Google OAuth — always shows account picker
  const { triggerGoogleLogin, googleLoading, googleError, setGoogleError } = useGoogleAuth(
    () => navigate(from, { replace: true })
  )

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true })
    }
  }, [from, isAuthenticated, navigate])

  useEffect(() => {
    clearError()
    setGoogleError('')
  }, [email, password, clearError, setGoogleError])

  function validate() {
    const e = {}
    if (!email)                            e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email address'
    if (!password)                         e.password = 'Password is required'
    setFieldErrs(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login submission error:", err)
    }
  }

  const inputCls = (field) => cn(
    'w-full h-full pl-11 pr-4 rounded-xl border text-sm transition-all outline-none bg-card text-text',
    fieldErrs[field]
      ? 'border-red-300 focus:ring-2 focus:ring-red-100'
      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/12'
  )

  const displayError = googleError || error

  return (
    <PageTransition>
      <div className="min-h-screen bg-transparent grid lg:grid-cols-[60fr_40fr]">

      {/* ── Left Side (60%) ── */}
      <div 
        className="hidden lg:flex flex-col relative overflow-hidden justify-between p-16 text-white"
        style={{ background: 'linear-gradient(135deg, #5B5FEF, #8B5CF6, #22D3EE)' }}
      >
        {/* Background Decorative Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 relative z-10 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">SyllabiX</span>
        </div>

        {/* Hero Copy */}
        <div className="my-auto max-w-2xl relative z-10 flex flex-col items-start">
          <h1 className="text-[64px] font-black leading-[1.1] tracking-tight mb-6">
            AI-Powered<br />Curriculum Design
          </h1>
          <p className="text-[20px] font-normal leading-relaxed text-white/90 mb-10 max-w-xl">
            Generate industry-ready curricula, semester plans, course structures and accreditation-ready syllabi in minutes.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-4 bg-white text-[#5B5FEF] font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-sm cursor-pointer"
          >
            Explore Platform
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Floating Statistics Cards */}
        <div className="grid grid-cols-3 gap-6 relative z-10 w-full max-w-2xl mt-auto">
          <motionFramer.div
            {...floatAnimation(0)}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/25 shadow-xl flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
              <Sparkles size={16} className="text-[#22D3EE]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/70">AI Generated</p>
              <h4 className="text-xl font-extrabold text-white mt-1">2 Seconds</h4>
            </div>
          </motionFramer.div>

          <motionFramer.div
            {...floatAnimation(0.4)}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/25 shadow-xl flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/70">24 Courses</p>
              <h4 className="text-xl font-extrabold text-white mt-1">Auto Structured</h4>
            </div>
          </motionFramer.div>

          <motionFramer.div
            {...floatAnimation(0.8)}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/25 shadow-xl flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
              <GraduationCap size={16} className="text-[#22D3EE]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/70">90 Credits</p>
              <h4 className="text-xl font-extrabold text-white mt-1">Accreditation Ready</h4>
            </div>
          </motionFramer.div>
        </div>
      </div>

      {/* ── Right Side (40%) ── */}
      <div className="flex items-center justify-center p-8 bg-[#FAFBFF] dark:bg-[#0B0F19] transition-colors">
        <motionFramer.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-[460px] bg-card rounded-[24px] shadow-xl border border-border p-10 flex flex-col justify-center transition-colors"
        >
          {/* Mobile logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 mb-8 lg:hidden cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-text">SyllabiX</span>
          </div>

          <h1 className="text-3xl font-black text-text tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-text-muted mb-8">Sign in to your account to continue</p>

          {/* Google Sign-In */}
          <button
            onClick={triggerGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-[56px] flex items-center justify-center gap-3 bg-card border border-border rounded-xl text-sm font-semibold text-text hover:border-primary/45 hover:shadow-sm transition-all mb-6 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {googleLoading
              ? <Loader2 size={16} className="animate-spin text-[#5B5FEF]" />
              : <GoogleIcon />
            }
            {googleLoading ? 'Opening Google…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border/80" />
            <span className="text-xs text-text-muted font-semibold">or continue with email</span>
            <div className="flex-1 h-px bg-border/80" />
          </div>

          {/* Error Banner */}
          {displayError && (
            <motionFramer.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-semibold"
            >
              {displayError}
            </motionFramer.p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative h-[56px]">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  autoComplete="email"
                  className={inputCls('email')}
                />
              </div>
              {fieldErrs.email && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrs.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
              </div>
              <div className="relative h-[56px]">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'} 
                  value={password}
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(inputCls('password'), 'pr-10')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrs.password && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrs.password}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input 
                type="checkbox" 
                checked={remember} 
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary bg-card" 
              />
              <span className="text-sm text-text-muted font-medium">Remember me</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit" 
              disabled={loading || googleLoading}
              className="w-full h-[56px] flex items-center justify-center gap-2.5 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-95 disabled:opacity-60 transition-all text-sm cursor-pointer btn-premium"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" />Signing in…</>
                : <><ArrowRight size={16} />Sign In</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create one free
            </Link>
          </p>
        </motionFramer.div>
      </div>
    </div>
    </PageTransition>
  )
}
