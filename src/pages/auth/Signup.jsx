import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion as motionFramer, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Loader2, GraduationCap, CheckCircle, XCircle, ArrowRight, Sparkles, BookOpen, BarChart3, Check } from 'lucide-react'
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

function getStrength(pw) {
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[a-z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const rules = [
  { label: '8+ characters',  test: pw => pw.length >= 8 },
  { label: 'One uppercase',    test: pw => /[A-Z]/.test(pw) },
  { label: 'One lowercase',    test: pw => /[a-z]/.test(pw) },
  { label: 'One number',       test: pw => /[0-9]/.test(pw) },
  { label: 'One special char', test: pw => /[^A-Za-z0-9]/.test(pw) },
]

const strengthLabels = ['', 'Weak', 'Weak', 'Medium', 'Strong', 'Strong']
const strengthColors  = ['', 'bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']

const floatAnimation = (delay) => ({
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 4.5,
    repeat: Infinity,
    ease: "easeInOut",
    delay: delay,
  }
})

export default function Signup() {
  const navigate = useNavigate()
  const { register, loading, error, clearError, isAuthenticated } = useAuthStore()

  const { triggerGoogleLogin, googleLoading, googleError } = useGoogleAuth(
    () => navigate('/', { replace: true })
  )

  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [showCf,     setShowCf]     = useState(false)
  const [terms,      setTerms]      = useState(false)
  const [fieldErrs,  setFieldErrs]  = useState({})
  const [pwFocus,    setPwFocus]    = useState(false)

  const strength = getStrength(password)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    clearError()
  }, [name, email, password, confirm, clearError])

  function validate() {
    const e = {}
    if (!name.trim())                         e.name     = 'Full name is required'
    if (!email)                               e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))    e.email    = 'Enter a valid email address'
    if (!password)                            e.password = 'Password is required'
    else if (strength < 3)                    e.password = 'Password is too weak'
    if (!confirm)                             e.confirm  = 'Please confirm your password'
    else if (confirm !== password)            e.confirm  = 'Passwords do not match'
    if (!terms)                               e.terms    = 'You must accept the terms'
    setFieldErrs(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    try {
      await register(name.trim(), email, password)
      navigate('/', { replace: true })
    } catch (err) {
      console.error("Signup submission error:", err)
    }
  }

  const inputCls = (field) => cn(
    'w-full h-[46px] pl-10 pr-4 rounded-xl border text-sm transition-all outline-none bg-card text-text',
    fieldErrs[field]
      ? 'border-red-300 focus:ring-2 focus:ring-red-100'
      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/12'
  )

  return (
    <PageTransition>
      <div className="min-h-screen h-screen bg-transparent grid lg:grid-cols-[55fr_45fr] overflow-hidden">

      {/* ── Left Side (55%) ── */}
      <div 
        className="hidden lg:flex flex-col relative overflow-hidden justify-between p-12 text-white h-full"
        style={{ background: 'linear-gradient(135deg, #5B5FEF, #8B5CF6, #22D3EE)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">SyllabiX</span>
        </div>

        {/* Content area */}
        <div className="my-auto max-w-xl relative z-10 flex flex-col items-start">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
            Start designing for free
          </h1>
          <p className="text-sm leading-relaxed text-white/85 mb-8 max-w-md">
            Join thousands of educators who create highly detailed, custom educational blueprints in minutes.
          </p>

          {/* Glassmorphic Benefits Card */}
          <div 
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFFFFF'
            }}
            className="w-full rounded-2xl p-6 shadow-xl space-y-4"
          >
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Benefits</p>
            <div className="space-y-3">
              {[
                'Unlimited Curriculum Generation',
                'AI-Powered Course Planning',
                'Semester Wise Roadmaps',
                'PDF & JSON Export',
                'Industry Focused Syllabi',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Analytics Cards */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <motionFramer.div
            {...floatAnimation(0)}
            className="absolute top-12 right-12 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl flex items-center gap-3 text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles size={14} className="text-[#22D3EE]" />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-medium">AI Powered</p>
              <p className="text-xs font-bold">Curriculum Design</p>
            </div>
          </motionFramer.div>

          <motionFramer.div
            {...floatAnimation(0.6)}
            className="absolute top-1/4 left-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl flex items-center gap-3 text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-medium">24 Courses</p>
              <p className="text-xs font-bold">Generated</p>
            </div>
          </motionFramer.div>

          <motionFramer.div
            {...floatAnimation(1.2)}
            className="absolute bottom-20 right-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl flex items-center gap-3 text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap size={14} className="text-[#22D3EE]" />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-medium">90 Credits</p>
              <p className="text-xs font-bold">Planned</p>
            </div>
          </motionFramer.div>

          <motionFramer.div
            {...floatAnimation(1.8)}
            className="absolute bottom-8 left-16 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl flex items-center gap-3 text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-medium">4 Semesters</p>
              <p className="text-xs font-bold">Structured</p>
            </div>
          </motionFramer.div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/60 relative z-10">
          © 2025 SyllabiX. All rights reserved.
        </div>
      </div>

      {/* ── Right Side (45%) ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#FAFBFF] dark:bg-[#0B0F19] overflow-y-auto h-full scrollbar-hide transition-colors">
        <motionFramer.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] bg-card rounded-[24px] shadow-2xl border border-border p-8 flex flex-col justify-center my-auto text-text transition-colors"
        >
          {/* Mobile logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 mb-6 lg:hidden cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-text">SyllabiX</span>
          </div>

          <h1 className="text-2xl font-black text-text tracking-tight mb-0.5">Create your account</h1>
          <p className="text-xs text-text-muted mb-5">Free forever. No credit card required.</p>

          {/* Google signup */}
          <button
            type="button"
            onClick={triggerGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-[46px] flex items-center justify-center gap-3 bg-card border border-border rounded-xl text-sm font-semibold text-text hover:border-primary/45 hover:shadow-sm transition-all mb-4 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {googleLoading
              ? <Loader2 size={15} className="animate-spin text-[#5B5FEF]" />
              : <GoogleIcon />
            }
            {googleLoading ? 'Opening Google…' : 'Continue with Google'}
          </button>

          {googleError && (
            <motionFramer.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-semibold"
            >
              {googleError}
            </motionFramer.p>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border/80" />
            <span className="text-[11px] text-text-muted font-semibold">or register with email</span>
            <div className="flex-1 h-px bg-border/80" />
          </div>

          {error && (
            <motionFramer.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-semibold"
            >
              {error}
            </motionFramer.p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative h-[46px]">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith" 
                  autoComplete="name"
                  className={inputCls('name')}
                />
              </div>
              {fieldErrs.name && <p className="text-xs text-red-500 mt-0.5 font-medium">{fieldErrs.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative h-[46px]">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  autoComplete="email"
                  className={inputCls('email')}
                />
              </div>
              {fieldErrs.email && <p className="text-xs text-red-500 mt-0.5 font-medium">{fieldErrs.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative h-[46px]">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPwFocus(true)}
                  onBlur={() => setPwFocus(false)}
                  placeholder="Create password"
                  autoComplete="new-password"
                  className={cn(inputCls('password'), 'pr-10')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength & validation checklist */}
              {password && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i}
                        className={cn('h-[3px] flex-1 rounded-full transition-all duration-300',
                          i <= strength ? strengthColors[strength] : 'bg-bg-secondary'
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-2', {
                    'text-red-500': strength <= 2,
                    'text-amber-500': strength === 3,
                    'text-emerald-500': strength >= 4,
                  })}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}

              <AnimatePresence>
                {(pwFocus || password) && (
                  <motionFramer.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 border border-border bg-bg-secondary/30 p-2.5 rounded-xl"
                  >
                    {rules.map(({ label, test }) => {
                      const ok = test(password)
                      return (
                        <div key={label} className="flex items-center gap-1.5">
                          {ok
                            ? <CheckCircle size={10} className="text-emerald-500 shrink-0" />
                            : <XCircle size={10} className="text-text-secondary/40 shrink-0" />
                          }
                          <span className={cn('text-[10px] truncate leading-none', ok ? 'text-emerald-600 dark:text-emerald-450 font-bold' : 'text-text-muted')}>{label}</span>
                        </div>
                      )
                    })}
                  </motionFramer.div>
                )}
              </AnimatePresence>
              {fieldErrs.password && <p className="text-xs text-red-500 mt-0.5 font-medium">{fieldErrs.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative h-[46px]">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showCf ? 'text' : 'password'} 
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)} 
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={cn(inputCls('confirm'), 'pr-10')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCf(!showCf)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrs.confirm && <p className="text-xs text-red-500 mt-0.5 font-medium">{fieldErrs.confirm}</p>}
            </div>

            {/* Terms checkbox */}
            <div className="py-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={terms} 
                  onChange={e => setTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/20 accent-primary bg-card shrink-0" 
                />
                <span className="text-xs text-text-muted leading-snug">
                  I agree to the{' '}
                  <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>
                </span>
              </label>
              {fieldErrs.terms && <p className="text-xs text-red-500 mt-0.5 font-medium">{fieldErrs.terms}</p>}
            </div>

            <button
              type="submit" 
              disabled={loading}
              className="w-full h-[46px] flex items-center justify-center gap-2.5 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-95 disabled:opacity-60 transition-all text-sm cursor-pointer btn-premium"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" />Creating account…</>
                : <><ArrowRight size={15} />Create Account</>
              }
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </motionFramer.div>
      </div>
    </div>
    </PageTransition>
  )
}
