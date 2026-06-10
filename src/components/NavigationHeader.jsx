import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import useStore from '../store'

export default function NavigationHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentRole = useStore(s => s.currentRole)

  // Determine back navigation capability dynamically
  const hasHistory = window.history.state && window.history.state.idx > 0

  // Respective dashboard home mapping
  const homePath = currentRole === 'student' ? '/student' : '/faculty'

  // Disable home highlight if already on home path
  const isAtHome = location.pathname === homePath

  return (
    <div className="bg-card/45 backdrop-blur-md border-b border-border/70 py-3 px-8 flex items-center justify-between z-20 shrink-0 select-none transition-colors">
      {/* Back Button */}
      <button
        disabled={!hasHistory}
        onClick={() => hasHistory && navigate(-1)}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 border border-border rounded-xl text-xs font-bold transition-all shadow-sm ${
          hasHistory
            ? 'bg-card text-text-primary hover:border-primary/45 hover:text-primary cursor-pointer active:scale-95'
            : 'bg-muted/10 text-text-secondary/40 border-border/50 cursor-not-allowed opacity-50'
        }`}
      >
        <ArrowLeft size={13} />
        <span>← Back</span>
      </button>

      {/* Home Button */}
      <button
        onClick={() => !isAtHome && navigate(homePath)}
        disabled={isAtHome}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 border border-border rounded-xl text-xs font-bold transition-all shadow-sm ${
          isAtHome
            ? 'bg-muted/10 text-text-secondary/40 border-border/50 cursor-not-allowed opacity-50'
            : 'bg-card text-text-primary hover:border-primary/45 hover:text-primary cursor-pointer active:scale-95'
        }`}
      >
        <Home size={13} />
        <span>🏠 Home</span>
      </button>
    </div>
  )
}
