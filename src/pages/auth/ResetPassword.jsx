import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, Loader2, GraduationCap, CheckCircle, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import PageTransition from '../../components/PageTransition'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [focus, setFocus] = useState(false)

  // Password rules
  const rules = [
    { label: '8+ characters', test: pw => pw.length >= 8 },
    { label: 'One uppercase',  test: pw => /[A-Z]/.test(pw) },
    { label: 'One lowercase',  test: pw => /[a-z]/.test(pw) },
    { label: 'One number',     test: pw => /[0-9]/.test(pw) },
    { label: 'One special char', test: pw => /[^A-Za-z0-9]/.test(pw) },
  ]
  const strength = rules.filter(r => r.test(password)).length
  const strengthLabels = ['', 'Weak', 'Weak', 'Medium', 'Strong', 'Strong']
  const strengthColors  = ['', 'bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!token) {
      setError('Invalid or missing reset token')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (strength < 4) {
      setError('Password must satisfy security criteria')
      return
    }
    
    setError('')
    setLoading(true)
    try {
      await api.resetPw(token, password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2.5 mb-10 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-text">SyllabiX</span>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-3xl border border-border shadow-xl p-8 text-text transition-colors">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
                    <Lock size={20} className="text-white" />
                  </div>
                  
                  <h1 className="text-xl font-black text-text mb-1">Reset Password</h1>
                  <p className="text-sm text-text-muted mb-7 leading-relaxed font-medium">
                    Enter your new password to secure your account.
                  </p>

                  {error && (
                    <p className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-semibold">
                      {error}
                    </p>
                  )}

                  {!token && (
                    <p className="mb-5 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-600 font-semibold">
                      Warning: No reset token was found in the URL. Ensure you opened the complete link.
                    </p>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    {/* New Password */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">New Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => { setPassword(e.target.value); setError('') }}
                          onFocus={() => setFocus(true)}
                          onBlur={() => setFocus(false)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all"
                        />
                        <button
                          type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>

                      {/* Password strength widget */}
                      {password && (
                        <div className="mt-3">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i}
                                className={cn('h-1 flex-1 rounded-full transition-all duration-300',
                                  i <= strength ? strengthColors[strength] : 'bg-border'
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
                        {(focus || password) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 border border-border bg-background p-3 rounded-2xl"
                          >
                            {rules.map(({ label, test }) => {
                              const ok = test(password)
                              return (
                                <div key={label} className="flex items-center gap-1.5">
                                  {ok
                                    ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                    : <XCircle size={11} className="text-text-muted/40 shrink-0" />
                                  }
                                  <span className={cn('text-[10px] truncate leading-none', ok ? 'text-emerald-600 font-semibold' : 'text-text-muted')}>{label}</span>
                                </div>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all"
                        />
                        <button
                          type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors cursor-pointer"
                        >
                          {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit" 
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 disabled:opacity-60 transition-all text-sm cursor-pointer btn-premium"
                    >
                      {loading
                        ? <><Loader2 size={16} className="animate-spin" />Resetting…</>
                        : <><ArrowRight size={16} />Save New Password</>
                      }
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-text mb-2">Password Reset Successful</h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-6 font-medium">
                    Your password has been changed successfully. You will be redirected to the login page shortly.
                  </p>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm text-primary font-bold hover:underline cursor-pointer"
                  >
                    Go to login page now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions footer */}
            <div className="flex items-center justify-center mt-6 pt-5 border-t border-border/60">
              <Link to="/login" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary font-semibold transition-colors">
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
