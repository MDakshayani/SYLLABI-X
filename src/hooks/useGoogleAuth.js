import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import useAuthStore from '../store/authStore'

/**
 * Returns { triggerGoogleLogin, googleLoading, googleError, setGoogleError }
 * Handles: Firebase popup → backend sync → Zustand store update
 */
export function useGoogleAuth(onSuccess) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError,   setGoogleError]   = useState('')
  const googleLogin = useAuthStore(s => s.googleLogin)

  async function triggerGoogleLogin() {
    setGoogleError('')
    setGoogleLoading(true)
    try {
      // googleProvider has prompt:'select_account' — always shows account picker
      const result = await signInWithPopup(auth, googleProvider)
      const { uid, displayName, email, photoURL } = result.user

      // Sync with Flask backend — creates user if new, returns JWT
      await googleLogin({ uid, name: displayName, email, photoURL })

      onSuccess?.()
    } catch (err) {
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        setGoogleError('Sign-in cancelled. Please try again.')
      } else if (err.code === 'auth/popup-blocked') {
        setGoogleError('Popup blocked by your browser. Please allow popups for this site.')
      } else if (err.code === 'auth/network-request-failed') {
        setGoogleError('Network error. Check your connection and try again.')
      } else {
        setGoogleError(err.message || 'Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return { triggerGoogleLogin, googleLoading, googleError, setGoogleError }
}
