import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  Sparkles, BookOpen, Clock, Cpu, FileDown, 
  ChevronRight, GraduationCap, 
  TrendingUp, CheckCircle, Settings, Layers, 
  Briefcase
} from 'lucide-react'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'

/* ── Live Number Counter Component ── */
function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0)
  const elementRef = useRef(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hasStarted) return
    let start = 0
    const duration = 2000 // 2 seconds animation
    const increment = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, hasStarted])

  return (
    <span ref={elementRef} className="font-extrabold tracking-tight text-[#FAFBFF] dark:text-[#F8FAFC]">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

/* ── Floating Card wrapper ── */
function DashCard({ className, delay = 0, style = {}, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      style={style}
      className={`absolute bg-card border border-border rounded-2xl shadow-xl p-4 transition-colors ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  // Mouse parallax coordinate calculation
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 35
      const y = (e.clientY - window.innerHeight / 2) / 35
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen bg-transparent flex flex-col relative z-10">
        
        {/* Navigation bar */}
        <Navbar />

        {/* ── 1. HERO SECTION ── */}
        <section className="relative pt-12 pb-16 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[52fr_48fr] gap-16 items-center">
            
            {/* Left Copy block */}
            <div className="text-left space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-text-primary leading-[1.1] tracking-tight"
              >
                Generate <span className="gradient-text">Industry-Ready</span> <br />
                Curriculum with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="body-text text-text-secondary max-w-xl"
              >
                Design structured, outcome-based, and industry-aligned curricula in minutes. Our AI-powered platform helps educators, institutions, and training organizations create modern learning pathways effortlessly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={() => navigate('/generate')}
                  className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-bold text-white gradient-bg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer btn-premium"
                >
                  <Sparkles size={14} />
                  <span>Generate Curriculum</span>
                  <ChevronRight size={14} />
                </button>
              </motion.div>
            </div>

            {/* Right Visual element (3D Parallax Dashboard Mockup) */}
            <div className="relative h-[480px] hidden lg:block select-none">
              
              {/* Main simulated browser panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                style={{ 
                  x: mousePos.x * 0.2, 
                  y: mousePos.y * 0.2,
                  perspective: 1000 
                }}
                className="absolute inset-x-8 top-8 bg-card rounded-3xl border border-border shadow-2xl overflow-hidden transition-colors"
              >
                {/* Simulated header tab */}
                <div className="gradient-bg px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-[9px] uppercase font-bold tracking-wider">AI Platform active</p>
                      <p className="text-white font-black text-sm mt-0.5">B.Sc in Machine Learning</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                      <GraduationCap size={15} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex gap-6 mt-4">
                    {[
                      { label: 'Courses', val: '24' },
                      { label: 'Total Credits', val: '90' },
                      { label: 'Semesters', val: '6' },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-white font-black text-lg leading-none">{val}</p>
                        <p className="text-white/60 text-[9px] uppercase font-semibold mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated courses feed */}
                <div className="p-4 space-y-2.5">
                  {[
                    { code: 'ML101', name: 'Python for Data Science', sem: 'Sem 1', credits: 3 },
                    { code: 'ML201', name: 'Supervised Learning', sem: 'Sem 2', credits: 4 },
                    { code: 'ML301', name: 'Deep Learning & NNs', sem: 'Sem 3', credits: 4 },
                  ].map(({ code, name, sem, credits }) => (
                    <div key={code} className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary/40 border border-border/40">
                      <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shadow-sm shrink-0">
                        <BookOpen size={12} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-bold text-text-primary truncate">{name}</p>
                        <p className="text-[10px] text-text-secondary">{code} · {sem}</p>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded shrink-0">{credits} cr</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Floating stats card */}
              <DashCard 
                className="right-0 top-6 w-44 p-4 z-20 hover-lift" 
                delay={0.5}
                style={{ x: mousePos.x * 0.4, y: mousePos.y * 0.4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp size={12} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Alignment</span>
                </div>
                <p className="text-2xl font-black text-text-primary text-left">94%</p>
                <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
                  <div className="w-[94%] h-full bg-emerald-500 rounded-full" />
                </div>
              </DashCard>

              {/* Floating structure checklist card */}
              <DashCard 
                className="left-0 bottom-24 w-52 p-4 z-20 hover-lift" 
                delay={0.6}
                style={{ x: mousePos.x * -0.3, y: mousePos.y * -0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle size={12} className="text-primary" />
                  </div>
                  <span className="text-xs font-extrabold text-text-primary">AI Validation</span>
                </div>
                <div className="space-y-1.5 text-[9px] text-primary font-bold border-t border-border/60 pt-2 text-left">
                  <div>✓ Outcomes Aligned</div>
                  <div>✓ Prerequisite Ordering</div>
                  <div>✓ Industry Mapped</div>
                </div>
              </DashCard>


            </div>
          </div>
        </section>

        {/* ── 2. WHY CHOOSE SECTION ── */}
        <section className="py-16 px-6 border-t border-border/40 bg-card/25">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="section-heading text-text-primary mb-4">Why Choose Our AI SyllabiX Platform?</h2>
            <p className="body-text text-text-secondary max-w-xl mx-auto mb-10">Accurate outcome mapping, fast structural builds, and industry aligned training modules.</p>

            <div className="flex flex-wrap justify-center gap-8">
              {[
                {
                  icon: Clock,
                  title: 'Faster Curriculum Design',
                  desc: 'Create complete course structures within minutes instead of weeks.',
                  color: 'text-primary',
                  bg: 'bg-primary/8',
                },
                {
                  icon: TrendingUp,
                  title: 'Industry Alignment',
                  desc: 'Generate curricula aligned with current industry trends and skills.',
                  color: 'text-secondary',
                  bg: 'bg-secondary/8',
                },
                {
                  icon: Layers,
                  title: 'Learning Outcome Mapping',
                  desc: 'Automatically connect topics with measurable learning outcomes.',
                  color: 'text-accent',
                  bg: 'bg-accent/8',
                },
                {
                  icon: Cpu,
                  title: 'Smart Topic Recommendations',
                  desc: 'Receive AI-powered suggestions for modules, topics, and assessments.',
                  color: 'text-primary',
                  bg: 'bg-primary/8',
                },
                {
                  icon: Settings,
                  title: 'Customizable Frameworks',
                  desc: 'Adapt generated curricula to university, corporate, or certification requirements.',
                  color: 'text-secondary',
                  bg: 'bg-secondary/8',
                },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] flex">
                  <div 
                    className="w-full p-8 bg-card border border-border rounded-3xl hover-lift shadow-sm flex flex-col text-left group"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className={color} />
                    </div>
                    <h3 className="card-heading text-text-primary mb-3">{title}</h3>
                    <p className="small-text text-text-secondary leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. HOW IT WORKS SECTION ── */}
        <section className="py-16 px-6 border-t border-border/40">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="section-heading text-text-primary mb-4">How It Works</h2>
            <p className="body-text text-text-secondary max-w-xl mx-auto mb-10">Design a customized education pathway in four simple, guided steps.</p>

            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-primary/30 via-secondary/20 to-transparent hidden lg:block -translate-y-1/2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {[
                  { step: '01', title: 'Course Details', desc: 'Enter course details, subject area, and target audience.' },
                  { step: '02', title: 'AI Analysis', desc: 'AI analyzes requirements and educational objectives.' },
                  { step: '03', title: 'Generate Modules', desc: 'Generate course modules, topics, outcomes, and assessments.' },
                  { step: '04', title: 'Review & Export', desc: 'Review, customize, and export the curriculum.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="p-6 bg-card border border-border rounded-3xl hover-lift shadow-sm text-left relative glass">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-black text-sm mb-5 shadow-lg shadow-primary/20">
                      {step}
                    </div>
                    <h3 className="card-heading text-text-primary mb-2">{title}</h3>
                    <p className="small-text text-text-secondary leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. KEY FEATURES SECTION ── */}
        <section className="py-16 px-6 border-t border-border/40 bg-card/25">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="section-heading text-text-primary mb-4">Key Platform Features</h2>
            <p className="body-text text-text-secondary max-w-xl mx-auto mb-10">Everything you need to deliver world-class educational structures.</p>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                { title: 'AI Curriculum Generation', desc: 'Auto-build syllabi mapping credits, course descriptions, and prerequisite courses.', icon: Cpu },
                { title: 'Topic Recommendations', desc: 'Receive intelligent suggestions for modules, reference material, and learning outcomes.', icon: Sparkles },
                { title: 'Industry Skill Alignment', desc: 'Automatically align generated course blueprints with modern industrial technologies.', icon: Briefcase },
                { title: 'Export to PDF and DOCX', desc: 'Export polished documents for accreditation reviews and stakeholder distributions.', icon: FileDown },
                { title: 'Academic Structure Optimization', desc: 'Balance workload progression and configure weekly seminar structures.', icon: Settings },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex">
                  <div className="w-full p-6 bg-card border border-border rounded-2xl hover-lift shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center mb-4 text-primary">
                        <Icon size={16} />
                      </div>
                      <h3 className="card-heading text-text-primary mb-2">{title}</h3>
                      <p className="small-text text-text-secondary leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. STATISTICS SECTION ── */}
        <section className="py-14 px-6 border-t border-border/40 gradient-bg text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { label: 'Curricula Generated', val: 5000, suffix: '+' },
                { label: 'Educators Supported', val: 1000, suffix: '+' },
                { label: 'Academic Domains', val: 50, suffix: '+' },
                { label: 'Time Saved', val: 95, suffix: '%' },
              ].map(({ label, val, suffix }) => (
                <div key={label} className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                  <p className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                    <Counter end={val} suffix={suffix} />
                  </p>
                  <p className="text-white/75 text-xs font-bold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. ABOUT SECTION ── */}
        <section className="py-16 px-6 border-t border-border/40">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Description Copy */}
            <div className="text-left space-y-6">
              <h2 className="section-heading text-text-primary leading-tight">
                Transforming Curriculum Design Through Artificial Intelligence
              </h2>
              
              <p className="body-text text-text-secondary leading-relaxed">
                Our AI SyllabiX Platform is designed to simplify and modernize the curriculum development process. By combining educational best practices with advanced artificial intelligence, the platform enables educators and institutions to create structured, outcome-driven learning experiences efficiently.
              </p>
              
              <p className="body-text text-text-secondary leading-relaxed">
                Whether designing university programs, certification courses, professional training modules, or online learning pathways, our system helps ensure academic quality, industry relevance, and learner success.
              </p>

            </div>

            {/* Right SVG Educational Vector Layout */}
            <div className="flex items-center justify-center">
              <svg className="w-full max-w-[460px] aspect-square text-primary" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer orbital rings */}
                <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" className="opacity-20" />
                <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="opacity-30" />
                
                {/* Central brain node */}
                <circle cx="200" cy="200" r="40" className="fill-card stroke-primary" strokeWidth="2.5" />
                <GraduationCap size={32} x="184" y="184" className="text-primary" />

                {/* Connecting nodes */}
                {[
                  { x: 100, y: 150, icon: Cpu },
                  { x: 300, y: 150, icon: Sparkles },
                  { x: 130, y: 300, icon: BookOpen },
                  { x: 270, y: 300, icon: FileDown }
                ].map(({ x, y, icon: Icon }, idx) => (
                  <g key={idx}>
                    <line x1="200" y1="200" x2={x} y2={y} stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
                    <circle cx={x} cy={y} r="20" className="fill-card stroke-secondary" strokeWidth="2" />
                    <Icon size={16} x={x - 8} y={y - 8} className="text-secondary animate-pulse" />
                  </g>
                ))}
              </svg>
            </div>

          </div>
        </section>

        {/* ── FOOTER SECTION ── */}
        <footer className="py-8 px-6 border-t border-border text-center bg-card mt-auto z-10 transition-colors">
          <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-2">
            <div 
              onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <GraduationCap size={15} className="text-white" />
              </div>
              <span className="font-extrabold text-sm text-text-primary">SyllabiX</span>
            </div>
            <p className="text-xs text-text-secondary font-medium">
              © 2026 SyllabiX. Built for educational excellence.
            </p>
          </div>
        </footer>

      </div>
    </PageTransition>
  )
}
