import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Loader2, GraduationCap, CheckCircle, ArrowLeft } from 'lucide-react'
import { auth } from '../../lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import PageTransition from '../../components/PageTransition'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const toast = {
    success: () => {
      setSent(true)
    },
    error: (msg) => {
      setError(msg)
    }
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    setLoading(true)
    
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("PASSWORD RESET EMAIL SENT");
      toast.success("Password reset email sent");
    }
    catch(error) {
      console.error("Firebase Reset Error Code:", error.code);
      console.error("Firebase Reset Error Message:", error.message);
      console.error(error);

      toast.error(`${error.code} - ${error.message}`);
    }
    finally {
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
              {!sent ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
                    <Mail size={20} className="text-white" />
                  </div>
                  
                  <h1 className="text-xl font-black text-text mb-1">Forgot your password?</h1>
                  <p className="text-sm text-text-muted mb-7 leading-relaxed font-medium">
                    No worries. Enter your email and we'll send you a reset link.
                  </p>

                  {error && (
                    <p className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-semibold">
                      {error}
                    </p>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Email Address</label>
                    <div className="relative mb-5">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email" 
                        value={email} 
                        onChange={e => { setEmail(e.target.value); setError('') }}
                        placeholder="you@example.com" 
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all"
                      />
                    </div>

                    <button
                      type="submit" 
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 disabled:opacity-60 transition-all text-sm cursor-pointer btn-premium"
                    >
                      {loading
                        ? <><Loader2 size={16} className="animate-spin" />Sending…</>
                        : <><ArrowRight size={16} />Send Reset Link</>
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
                  
                  <h2 className="text-xl font-bold text-text mb-2">Check your inbox</h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-6">
                    We've sent a password reset link to{' '}
                    <span className="font-bold text-text">{email}</span>.
                    Check your spam folder if you don't see it.
                  </p>
                  
                  <button
                    onClick={() => { setSent(false); setEmail('') }}
                    className="text-sm text-primary font-bold hover:underline cursor-pointer"
                  >
                    Didn't receive it? Send again
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
