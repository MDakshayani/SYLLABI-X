import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Palette, Bell,
  History, Download, LogOut, Eye, EyeOff, Loader2,
  Camera, X, CheckCircle2, XCircle
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import { cn } from '../lib/utils'
import PageTransition from '../components/PageTransition'
import { api } from '../lib/api'
import { auth } from '../lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'


const colorThemes = [
  { name: 'Indigo Purple', hex: '#5B5FEF' },
  { name: 'Ocean Blue', hex: '#2563EB' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Sunset Orange', hex: '#F97316' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Midnight Dark', hex: '#1E293B' },
]

const activityLog = [
  { id: 1, event: 'User Login', date: '2026-06-08 11:02:48', ip: '192.168.1.47', status: 'Success' },
  { id: 2, event: 'Theme Changed to Midnight Dark', date: '2026-06-08 10:45:12', ip: '192.168.1.47', status: 'Success' },
  { id: 3, event: 'Curriculum Generation (ML Masters)', date: '2026-06-07 14:22:01', ip: '192.168.1.47', status: 'Success' },
  { id: 4, event: 'Exported PDF Curriculum', date: '2026-06-07 14:23:45', ip: '192.168.1.47', status: 'Success' },
  { id: 5, event: 'Profile Information Updated', date: '2026-06-06 09:12:30', ip: '192.168.1.12', status: 'Success' }
]

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-primary/20',
        checked ? 'bg-primary' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

export default function Profile() {
  const user = useAuthStore(s => s.user)
  const setShowLogoutConfirm = useAuthStore(s => s.setShowLogoutConfirm)

  const [activeTab, setActiveTab] = useState('profile')
  const [successMsg, setSuccessMsg] = useState('')

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState('')


  // 1. Profile information states
  const [fullName, setFullName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [institution, setInstitution] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [timezone, setTimezone] = useState('')
  const [profilePhoto, setProfilePhoto] = useState(user?.photo_url || '')
  const [phoneError, setPhoneError] = useState('')
  const fileInputRef = useRef(null)

  const fetchProfile = useAuthStore(s => s.fetchProfile)

  // Sync state with user store when it changes
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setFullName(user.name || '')
        setEmail(user.email || '')
        setPhone(user.phone || '')
        setInstitution(user.institution || '')
        setRole(user.role || '')
        setBio(user.bio || '')
        setCountry(user.country || '')
        setTimezone(user.timezone || '')
        setProfilePhoto(user.photo_url || '')
      }, 0)
    }
  }, [user])

  // Sync profile details on mount
  useEffect(() => {
    const syncProfile = async () => {
      try {
        await fetchProfile()
      } catch (err) {
        console.error("Error fetching profile on mount:", err)
      }
    }
    syncProfile()
  }, [fetchProfile])

  // 2. Security/password states
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwFocus, setPwFocus] = useState(false)

  // 3. Theme states
  const [theme, setTheme] = useState(() => localStorage.getItem('curriculum-ai-theme') || 'system')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('curriculum-ai-accent-color') || '#5B5FEF')

  // 4. Notifications toggles
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(false)
  const [notifComplete, setNotifComplete] = useState(true)
  const [notifExport, setNotifExport] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(false)

  // 5. Preferences states
  const [prefLevel] = useState('Bachelor')
  const [prefHours] = useState('40')
  const [prefFormat] = useState('PDF')
  const [prefLang] = useState('English (US)')
  const [prefTimeFormat] = useState('12h')

  // Password Strength Rules
  const rules = [
    { label: '8+ characters', test: pw => pw.length >= 8 },
    { label: 'One uppercase',  test: pw => /[A-Z]/.test(pw) },
    { label: 'One lowercase',  test: pw => /[a-z]/.test(pw) },
    { label: 'One number',     test: pw => /[0-9]/.test(pw) },
    { label: 'One special char', test: pw => /[^A-Za-z0-9]/.test(pw) },
  ]
  const strength = rules.filter(r => r.test(newPw)).length

  // Profile photo methods
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setProfilePhoto('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 10) {
      setPhone(val)
      setPhoneError('')
    }
  }

  // Trigger changes
  const saveProfileInfo = async (e) => {
    e.preventDefault()

    if (!phone || phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number.")
      return
    }

    try {
      const data = await api.updateProfile({
        name: fullName,
        email,
        phone,
        institution,
        role,
        bio,
        country,
        timezone,
        photo_url: profilePhoto
      })
      useAuthStore.getState().setUser(data.user)
      setSuccessMsg('Profile information updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      alert(err.message || 'Failed to update profile')
    }
  }

  const saveSecurity = (e) => {
    e.preventDefault()
    if (newPw !== confirmPw) {
      alert('Passwords do not match')
      return
    }
    setSuccessMsg('Password changed successfully!')
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Live Theme controls
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('curriculum-ai-theme', newTheme)
    window.dispatchEvent(new Event('theme-changed'))
  }

  const handleAccentChange = (color) => {
    setAccentColor(color)
    localStorage.setItem('curriculum-ai-accent-color', color)
    document.documentElement.style.setProperty('--custom-accent-color', color)
    document.documentElement.style.setProperty('--custom-accent-color-hover', color)
    document.documentElement.style.setProperty('--primary-color-val', color)
  }

  // Live JSON Download generators
  const downloadJSONData = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto p-4 md:p-8 w-full min-h-[calc(100vh-120px)] flex flex-col bg-transparent">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-success text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/20"
          >
            <CheckCircle2 size={16} />
            <span className="text-xs">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start flex-1">
        
        {/* ── LEFT SIDEBAR ── */}
        <aside className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-3">Account</h3>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'profile'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-primary/8 hover:text-primary'
                )}
              >
                <User size={14} />
                Profile Information
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'security'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-primary/8 hover:text-primary'
                )}
              >
                <Lock size={14} />
                Security
              </button>

              <button
                onClick={() => setActiveTab('appearance')}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'appearance'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-primary/8 hover:text-primary'
                )}
              >
                <Palette size={14} />
                Appearance
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'notifications'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-primary/8 hover:text-primary'
                )}
              >
                <Bell size={14} />
                Notifications
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'history'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-primary/8 hover:text-primary'
                )}
              >
                <History size={14} />
                Activity History
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'export'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-primary/8 hover:text-primary'
                )}
              >
                <Download size={14} />
                Export Data
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* ── RIGHT PANEL CONTENT ── */}
        <main className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex-1">
          
          {/* TAB 1: Profile Information */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-black text-text-primary mb-6">Profile Information</h2>
              <form onSubmit={saveProfileInfo} className="space-y-6">
                
                {/* Profile Photo Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
                  <div className="relative group">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-background border-2 border-border flex items-center justify-center text-text-secondary">
                        <User size={30} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer border-2 border-card"
                    >
                      <Camera size={12} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                    <p className="text-xs font-bold text-text-primary">Upload profile photo</p>
                    <p className="text-[10px] text-text-secondary">JPG, JPEG or PNG. Max size 2MB.</p>
                    <div className="flex gap-2.5 mt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-border hover:border-primary/50 rounded-xl text-[10px] font-semibold text-text-secondary hover:text-primary cursor-pointer bg-card hover:bg-primary/5 transition-colors"
                      >
                        Choose File
                      </button>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-4 py-2 border border-red-200 hover:border-red-500 rounded-xl text-[10px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel" value={phone} onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl border bg-card text-text-primary text-xs outline-none focus:border-primary",
                        phoneError ? "border-red-500 focus:border-red-500" : "border-border"
                      )}
                    />
                    {phoneError && (
                      <p className="text-red-500 text-[10px] font-semibold mt-1">
                        {phoneError}
                      </p>
                    )}
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Institution / Organization</label>
                    <input
                      type="text" value={institution} onChange={e => setInstitution(e.target.value)}
                      placeholder="Enter institution"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Role</label>
                    <input
                      type="text" value={role} onChange={e => setRole(e.target.value)}
                      placeholder="Enter role"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Country</label>
                    <select
                      value={country} onChange={e => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary cursor-pointer text-text-primary"
                    >
                      <option value="" disabled>Select country</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>India</option>
                      <option>Germany</option>
                      <option>France</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Timezone</label>
                    <select
                      value={timezone} onChange={e => setTimezone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="" disabled>Select timezone</option>
                      <option>GMT-8 (PST)</option>
                      <option>GMT-5 (EST)</option>
                      <option>GMT+0 (UTC)</option>
                      <option>GMT+1 (CET)</option>
                      <option>GMT+5:30 (IST)</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Bio</label>
                    <textarea
                      value={bio} onChange={e => setBio(e.target.value)} rows={3}
                      placeholder="Tell us about yourself"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button" onClick={() => {
                      setFullName(user?.name || '')
                      setEmail(user?.email || '')
                      setPhone('')
                      setInstitution('')
                      setRole('')
                      setCountry('')
                      setTimezone('')
                      setBio('')
                    }}
                    className="px-5 py-2.5 border border-border rounded-xl text-xs font-semibold text-text-secondary hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity text-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Security */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-black text-text-primary mb-6">Security Settings</h2>
              <form onSubmit={saveSecurity} className="space-y-6">
                
                {/* Current Password */}
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                    >
                      {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPw} onChange={e => setNewPw(e.target.value)}
                      onFocus={() => setPwFocus(true)}
                      onBlur={() => setPwFocus(false)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                    >
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Password strength widget */}
                  {newPw && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
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
                    {(pwFocus || newPw) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 border border-border bg-background p-3 rounded-2xl"
                      >
                        {rules.map(({ label, test }) => {
                          const ok = test(newPw)
                          return (
                            <div key={label} className="flex items-center gap-1.5">
                              {ok
                                ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                : <XCircle size={11} className="text-text-secondary/40 shrink-0" />
                              }
                              <span className={cn('text-[10px] truncate leading-none', ok ? 'text-emerald-600 font-semibold' : 'text-text-secondary')}>{label}</span>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(auth.currentUser?.email || user?.email || '')
                      setForgotError('')
                      setForgotSuccess(false)
                      setShowForgotModal(true)
                    }}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer bg-transparent border-0 outline-none"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity text-xs cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Appearance */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-black text-text-primary mb-6">Appearance Settings</h2>
              
              {/* Light/Dark theme */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-text-primary mb-3">Theme Mode</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Light theme mockup button */}
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={cn(
                        'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 text-left bg-card transition-all cursor-pointer hover:border-text-secondary/50',
                        theme === 'light' ? 'border-primary shadow-md' : 'border-border'
                      )}
                    >
                      <div className="w-full h-16 bg-background border border-border rounded-xl flex items-center justify-center shadow-inner">
                        <div className="w-12 h-6 bg-card border border-border rounded shadow-sm" />
                      </div>
                      <span className="text-xs font-bold text-text-primary">Light Mode</span>
                    </button>

                    {/* Dark theme mockup button */}
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={cn(
                        'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 text-left bg-card transition-all cursor-pointer hover:border-text-secondary/50',
                        theme === 'dark' ? 'border-primary shadow-md' : 'border-border'
                      )}
                    >
                      <div className="w-full h-16 bg-background border border-border rounded-xl flex items-center justify-center shadow-inner">
                        <div className="w-12 h-6 bg-card border border-border rounded shadow-sm" />
                      </div>
                      <span className="text-xs font-bold text-text-primary">Dark Mode</span>
                    </button>

                    {/* System theme mockup button */}
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={cn(
                        'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 text-left bg-card transition-all cursor-pointer hover:border-text-secondary/50',
                        theme === 'system' ? 'border-primary shadow-md' : 'border-border'
                      )}
                    >
                      <div className="w-full h-16 bg-background border border-border rounded-xl flex items-center justify-center shadow-inner">
                        <div className="w-12 h-6 bg-card border border-border rounded shadow-sm" />
                      </div>
                      <span className="text-xs font-bold text-text-primary">System Mode</span>
                    </button>
                  </div>
                </div>

                {/* Accent colors */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-xs font-bold text-text-primary mb-3">Accent Colors</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {colorThemes.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => handleAccentChange(c.hex)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-card',
                          accentColor === c.hex
                            ? 'border-primary'
                            : 'border-border hover:border-text-secondary/40'
                        )}
                      >
                        <div className="w-6 h-6 rounded-full shadow-inner border border-white" style={{ backgroundColor: c.hex }} />
                        <span className="text-[9px] font-bold text-text-secondary text-center">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-black text-text-primary mb-6">Notifications Settings</h2>
              <div className="space-y-4">
                {[
                  { title: 'Email Notifications', desc: 'Receive newsletters, system notifications, and security updates.', val: notifEmail, setter: setNotifEmail },
                  { title: 'Push Notifications', desc: 'Receive real-time banners and indicators directly in the browser.', val: notifPush, setter: setNotifPush },
                  { title: 'Curriculum Completion Alerts', desc: 'Receive alert messages when AI finishes generating blueprints.', val: notifComplete, setter: setNotifComplete },
                  { title: 'Export Notifications', desc: 'Receive updates when exported DOCX/PDF folders are compiled.', val: notifExport, setter: setNotifExport },
                  { title: 'Product Updates', desc: 'Receive email alerts for new educational features and layout releases.', val: notifUpdates, setter: setNotifUpdates },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                    <div className="max-w-[80%]">
                      <h4 className="text-xs font-extrabold text-text-primary">{item.title}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle checked={item.val} onChange={item.setter} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Activity History */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-black text-text-primary mb-6">Activity History</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Event</th>
                      <th className="pb-3">Date / Time</th>
                      <th className="pb-3">IP Address</th>
                      <th className="pb-3 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log) => (
                      <tr key={log.id} className="border-b border-border/30 text-text-secondary font-medium hover:bg-primary/5">
                        <td className="py-4.5 pl-2 font-bold text-text-primary">{log.event}</td>
                        <td className="py-4.5">{log.date}</td>
                        <td className="py-4.5 font-mono">{log.ip}</td>
                        <td className="py-4.5 pr-2">
                          <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 font-bold px-2.5 py-1 rounded-md text-[10px]">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: Export Data */}
          {activeTab === 'export' && (
            <div>
              <h2 className="text-xl font-black text-text-primary mb-6">Export Your Account Data</h2>
              <p className="text-xs text-text-secondary mb-6">Download your custom curriculum templates, profile data, or settings backup for safekeeping.</p>
              
              <div className="grid sm:grid-cols-3 gap-4">
                
                {/* Download Profile Card */}
                <div className="bg-background border border-border p-5 rounded-2xl text-center flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-text-primary mb-2">Profile Data</h4>
                    <p className="text-[10px] text-text-secondary leading-normal mb-4">Export name, phone, bio, and organizational settings details.</p>
                  </div>
                  <button
                    onClick={() => downloadJSONData({ fullName, email, phone, institution, role, bio, country, timezone }, 'profile_data.json')}
                    className="w-full py-2 bg-card border border-border hover:border-primary/50 rounded-xl text-[10px] font-bold text-text-primary hover:text-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Download JSON
                  </button>
                </div>

                {/* Download History Card */}
                <div className="bg-background border border-border p-5 rounded-2xl text-center flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-text-primary mb-2">Curriculum History</h4>
                    <p className="text-[10px] text-text-secondary leading-normal mb-4">Download history log metadata representing generated curricula.</p>
                  </div>
                  <button
                    onClick={() => downloadJSONData({ records: activityLog.filter(a => a.event.includes('Curriculum')) }, 'curriculum_history.json')}
                    className="w-full py-2 bg-card border border-border hover:border-primary/50 rounded-xl text-[10px] font-bold text-text-primary hover:text-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Download JSON
                  </button>
                </div>

                {/* Download Settings Card */}
                <div className="bg-background border border-border p-5 rounded-2xl text-center flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-text-primary mb-2">Settings Backup</h4>
                    <p className="text-[10px] text-text-secondary leading-normal mb-4">Export active color, theme preferences, and toggle status details.</p>
                  </div>
                  <button
                    onClick={() => downloadJSONData({ theme, accentColor, preferences: { prefLevel, prefHours, prefFormat, prefLang, prefTimeFormat } }, 'settings_backup.json')}
                    className="w-full py-2 bg-card border border-border hover:border-primary/50 rounded-xl text-[10px] font-bold text-text-primary hover:text-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Download JSON
                  </button>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── RESET PASSWORD MODAL ── */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-sm w-full text-left"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-extrabold text-text-primary">Reset Password</h3>
                <button 
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotError(''); setForgotSuccess(false); setForgotEmail('') }}
                  className="p-1 rounded-lg hover:bg-primary/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              {!forgotSuccess ? (
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
                    setForgotError('Enter a valid email address')
                    return
                  }
                  setForgotError('')
                  setForgotLoading(true)

                  console.log("Current User:", auth.currentUser);
                  console.log("Current Email:", auth.currentUser?.email);

                  const resetEmail = auth.currentUser?.email || forgotEmail || user?.email;
                  console.log("Reset Email being passed:", resetEmail);

                  try {
                    await sendPasswordResetEmail(auth, resetEmail)
                    setForgotSuccess(true)
                  } catch (error) {
                    console.error("Firebase Reset Error Code:", error.code);
                    console.error("Firebase Reset Error Message:", error.message);
                    console.error(error);
                    setForgotError(`${error.code} - ${error.message}`)
                  } finally {
                    setForgotLoading(false)
                  }
                }} className="space-y-4">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Enter your registered email address. We will send a password reset link.
                  </p>

                  {forgotError && (
                    <p className="px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-semibold">
                      {forgotError}
                    </p>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError('') }}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text-primary text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowForgotModal(false); setForgotError(''); setForgotSuccess(false); setForgotEmail('') }}
                      className="flex-1 py-2.5 border border-border rounded-xl text-xs font-semibold text-text-secondary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 disabled:opacity-60 transition-opacity text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {forgotLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                      <span>Send Reset Link</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Email Sent Successfully</h4>
                    <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                      We've sent a password reset link to <span className="font-bold text-text-primary">{forgotEmail}</span>. Check your email (and server log) to complete recovery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(false); setForgotSuccess(false); setForgotEmail('') }}
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </PageTransition>
  )
}

// Helpers for security tabs
const strengthLabels = ['', 'Weak', 'Weak', 'Medium', 'Strong', 'Strong']
const strengthColors  = ['', 'bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']
