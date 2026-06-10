import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Layers, Award, TrendingUp, Sparkles, ArrowRight, Clock, ChevronRight } from 'lucide-react'
import useStore from '../store'
import PageTransition from '../components/PageTransition'

// Statistics Counter component
function StatCounter({ value, suffix = '', duration = 1.0 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const end = parseInt(value)
    if (isNaN(end)) {
      setTimeout(() => setCount(value), 0)
      return
    }
    const increment = end / (duration * 60)
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count.toLocaleString()}{suffix}</span>
}

function StatCard({ title, value, sub, Icon, bgClass, textClass, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 text-left"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass} ${textClass}`}>
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">{sub}</span>
      </div>
      <p className="text-3xl font-black text-text-primary mb-1">
        <StatCounter value={value} suffix={value.includes('%') ? '%' : ''} />
      </p>
      <p className="text-xs font-semibold text-text-secondary">{title}</p>
    </motion.div>
  )
}

// PREMIUM CUSTOM ANIMATED AREA CHART
const GenerationActivityChart = () => (
  <div className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-sm font-bold text-text-primary">Syllabus Production History</h3>
        <p className="text-[10px] text-text-secondary font-semibold mt-0.5">Monthly course generation load</p>
      </div>
      <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Syllabi Credits</span>
        </div>
      </div>
    </div>

    {/* SVG Chart area with Framer Motion path animations */}
    <div className="relative h-44 w-full">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
        {/* Grid lines */}
        <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-color)" strokeWidth="1" className="opacity-40" />
        <line x1="0" y1="60" x2="500" y2="60" stroke="var(--border-color)" strokeWidth="1" className="opacity-40" />
        <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color)" strokeWidth="1" className="opacity-40" />
        <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border-color)" strokeWidth="1.5" className="opacity-70" />

        {/* Chart Area Fill */}
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--secondary-color-val)" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        
        {/* Area fill path */}
        <motion.path 
          d="M 0 140 Q 80 120 120 70 T 250 80 T 380 40 T 500 20 L 500 140 Z"
          fill="url(#chartGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Main Line path */}
        <motion.path 
          d="M 0 140 Q 80 120 120 70 T 250 80 T 380 40 T 500 20"
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Secondary line (Cyan) */}
        <motion.path 
          d="M 0 130 Q 80 90 140 100 T 280 50 T 400 90 T 500 35"
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Chart vertices dots */}
        <motion.circle cx="120" cy="70" r="5" fill="var(--accent-color)" stroke="var(--card-bg)" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
        <motion.circle cx="250" cy="80" r="5" fill="var(--secondary-color-val)" stroke="var(--card-bg)" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
        <motion.circle cx="380" cy="40" r="5" fill="#22D3EE" stroke="var(--card-bg)" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
      </svg>
    </div>

    {/* Labels x-axis */}
    <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary px-1">
      <span>JAN</span>
      <span>FEB</span>
      <span>MAR</span>
      <span>APR</span>
      <span>MAY</span>
      <span>JUN</span>
    </div>
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const { 
    currentRole, 
    facultyHistoryData, 
    studentHistoryData,
    loadFacultyHistoryData,
    loadStudentHistoryData
  } = useStore()

  useEffect(() => {
    if (currentRole === 'faculty') {
      loadFacultyHistoryData()
    } else {
      loadStudentHistoryData()
    }
  }, [currentRole, loadFacultyHistoryData, loadStudentHistoryData])

  const history = currentRole === 'faculty' ? facultyHistoryData : studentHistoryData


  const stats = [
    { title: 'Curricula Generated', value: '12', sub: '+3 this week', icon: BookOpen, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    { title: 'Total Courses', value: '184', sub: 'Across programs', icon: Layers, bgClass: 'bg-secondary/10', textClass: 'text-secondary' },
    { title: 'Total Credits', value: '720', sub: '60 per program', icon: Award, bgClass: 'bg-accent/10', textClass: 'text-accent' },
    { title: 'Completion Rate', value: '94%', sub: 'Finalized', icon: TrendingUp, bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-500' },
  ]

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto space-y-8 bg-transparent relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">Dashboard</h1>
          <p className="text-text-secondary text-sm">Overview of your AI-generated curricula analytics</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.title} {...s} delay={i * 0.05} />)}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Area: Area Chart & Table */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GenerationActivityChart />
            </motion.div>

            {/* Recent Table */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold text-text-primary text-sm">Recent Curricula</h2>
                <button 
                  onClick={() => navigate('/history')} 
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span> 
                  <ChevronRight size={12} />
                </button>
              </div>

              <div className="divide-y divide-border">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/curriculum')}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/15 shrink-0">
                      <BookOpen size={14} className="text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-text-primary text-sm truncate leading-tight">{item.program_name}</p>
                      <p className="text-[10px] text-text-secondary mt-1 font-semibold">
                        {item.education_level} · {item.industry_focus}
                      </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-primary">{item.stats.totalCredits} cr</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{item.program_duration}</p>
                    </div>
                    
                    <ChevronRight size={14} className="text-slate-350 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="px-6 py-12 text-center text-text-secondary">
                    <BookOpen size={28} className="mx-auto mb-2 text-border" />
                    <p className="text-xs font-medium">No curricula generated yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: AI Status & Quick Actions */}
          <div className="space-y-6">
            
            {/* AI Status */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border shadow-sm p-6"
            >
              <h3 className="font-bold text-text-primary text-sm text-left mb-4">AI Model Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Syllabus Synthesizer', status: 'Active', color: 'bg-emerald-400' },
                  { label: 'Outcomes Alignement', status: 'Ready', color: 'bg-emerald-400' },
                  { label: 'PDF Documentation', status: 'Ready', color: 'bg-emerald-400' },
                ].map(({ label, status, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
                      <span className="font-bold text-text-primary">{label}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">{status}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card rounded-2xl border border-border shadow-sm p-6"
            >
              <h3 className="font-bold text-text-primary text-sm text-left mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Generate Curriculum', icon: Sparkles, action: '/generate' },
                  { label: 'Browse Templates', icon: BookOpen, action: '/templates' },
                  { label: 'View History', icon: Clock, action: '/history' },
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={() => navigate(action)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 text-xs font-bold text-text-secondary hover:text-primary transition-all group cursor-pointer"
                  >
                    <Icon size={14} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
                    <span>{label}</span>
                    <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </PageTransition>
  )
}
