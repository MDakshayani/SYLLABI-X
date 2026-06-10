import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, Sparkles, ArrowRight, Award, TrendingUp,
  School, Landmark, Briefcase, Cpu, Layers, Settings,
  Terminal, Brain, Edit, FileDown, ChevronRight
} from 'lucide-react'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import { GradientBlobs, HeroParticles, AboutFloatingCards } from '../components/AboutBackground'

// SECTION 1 (HERO) - Mockup Dashboard UI
const HeroDashboardMockup = () => {
  return (
    <div className="relative w-full max-w-[500px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden aspect-[4/3] p-4 text-slate-200">
      
      {/* Browser Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="w-40 bg-slate-800/80 rounded-lg py-1 px-3 text-[9px] text-slate-400 text-center font-mono truncate">
          curriculum-ai.edu/generate
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
          <GraduationCap size={12} className="text-[#22D3EE]" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 h-[calc(100%-40px)]">
        {/* Left Sidebar */}
        <div className="col-span-2 border-r border-slate-800 pr-2 space-y-3 pt-1">
          <div className="w-full aspect-square bg-[#5B5FEF]/10 border border-[#5B5FEF]/30 rounded-xl flex items-center justify-center text-[#5B5FEF]">
            <Cpu size={14} />
          </div>
          <div className="w-full aspect-square bg-slate-850/50 rounded-xl flex items-center justify-center text-slate-500">
            <Layers size={14} />
          </div>
          <div className="w-full aspect-square bg-slate-850/50 rounded-xl flex items-center justify-center text-slate-500">
            <Settings size={14} />
          </div>
        </div>

        {/* Center Main Dashboard Panel */}
        <div className="col-span-10 pl-1 space-y-3 overflow-y-auto scrollbar-hide pr-1">
          {/* Top Panel stats */}
          <div className="flex justify-between items-center bg-slate-800/40 border border-slate-800/50 rounded-xl p-3">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Active Curriculum</p>
              <h4 className="text-xs font-bold text-white">M.S. in Applied Data Science</h4>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded">
                Active Roadmap
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Semester Roadmap Panel */}
            <div className="bg-slate-800/30 border border-slate-800/50 rounded-xl p-3 space-y-2">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Semester Roadmap</p>
              
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 space-y-1">
                <div className="flex justify-between text-[8px] font-bold">
                  <span>Semester 1</span>
                  <span className="text-[#5B5FEF]">12 Credits</span>
                </div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="w-[100%] h-full bg-[#5B5FEF]" />
                </div>
              </div>

              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 space-y-1">
                <div className="flex justify-between text-[8px] font-bold">
                  <span>Semester 2</span>
                  <span className="text-[#8B5CF6]">15 Credits</span>
                </div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="w-[80%] h-full bg-[#8B5CF6]" />
                </div>
              </div>
            </div>

            {/* Curriculum Analytics Panel */}
            <div className="bg-slate-800/30 border border-slate-800/50 rounded-xl p-3 flex flex-col justify-between">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Analytics Overview</p>
              <div className="flex items-center gap-3 py-1">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#5B5FEF" strokeWidth="3.5" strokeDasharray="45 100" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeDasharray="30 100" strokeDashoffset="-45" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22D3EE" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="-75" />
                  </svg>
                  <span className="absolute text-[8px] font-bold font-mono">90C</span>
                </div>
                
                <div className="space-y-1 text-[7px] font-semibold">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF]" />
                    <span>CS Core (45%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                    <span>Electives (30%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                    <span>Math (25%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Card & Learning Outcomes Detail */}
          <div className="bg-slate-800/30 border border-slate-800/50 rounded-xl p-3 grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Course Detail</p>
              <div className="bg-slate-800/80 border border-slate-700/50 p-2 rounded-lg space-y-1.5 text-left">
                <p className="text-[8px] text-slate-400 font-mono">CS-501</p>
                <h5 className="text-[9px] font-bold text-white leading-tight">Applied Machine Learning</h5>
                <div className="flex gap-2 text-[7px] text-slate-400 font-semibold">
                  <span>4 Credits</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Learning Outcomes</p>
              <div className="space-y-1 text-[8px] font-medium text-slate-300">
                <div className="flex items-center gap-1">
                  <span>✓ Implement Gradient Descent</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>✓ Design neural networks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function About() {
  const navigate = useNavigate()

  const flowSteps = [
    { step: '01', title: 'Requirements', desc: 'Define title, duration, subject area, and target audience level.', icon: Terminal },
    { step: '02', title: 'Skill Mapping', desc: 'AI maps required competencies and industry-standard technologies.', icon: Brain },
    { step: '03', title: 'Workload Balance', desc: 'Distribute course credits and sequence prerequisites logically.', icon: Layers },
    { step: '04', title: 'Syllabus Synthesize', desc: 'Build course codes, descriptions, and weekly module structures.', icon: Cpu },
    { step: '05', title: 'Outcomes Check', desc: 'Verify topic maps with academic standards and outcomes.', icon: Edit },
    { step: '06', title: 'PDF Package Export', desc: 'Download accredited, ready-to-share curriculum blueprints.', icon: FileDown }
  ]

  const categories = [
    { title: 'Universities', img: '/categories/university_campus_card.png', icon: Landmark },
    { title: 'Colleges', img: '/categories/college_classroom_card.png', icon: School },
    { title: 'Schools', img: '/categories/school_classroom_card.png', icon: GraduationCap },
    { title: 'Training Institutes', img: '/categories/training_workshop_card.png', icon: Briefcase },
    { title: 'EdTech Companies', img: '/categories/edtech_team_card.png', icon: Cpu },
    { title: 'Corporate Learning', img: '/categories/corporate_training_card.png', icon: Layers },
    { title: 'Independent Educators', img: '/categories/independent_educator_card.png', icon: Sparkles }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen text-text-primary flex flex-col overflow-x-hidden relative bg-transparent">
        
        {/* Premium animated background layers */}
        <GradientBlobs />
        <AboutFloatingCards />

        <Navbar />

        {/* ── SECTION 1: HERO (Desktop Split Layout) ── */}
        <section className="relative pt-12 pb-16 px-6 z-10 border-b border-border/40 overflow-hidden">
          <HeroParticles />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Text Column */}
            <div className="lg:col-span-5 text-left space-y-5">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-extrabold leading-[1.15] tracking-tight text-text-primary"
              >
                About SyllabiX <br />
                <span className="gradient-text">AI Learning Platform</span>
              </motion.h1>

              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-base md:text-lg font-semibold text-secondary leading-snug"
              >
                AI-powered curriculum design platform for universities, institutions, bootcamps, and educators.
              </motion.h3>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm md:text-base leading-relaxed text-text-secondary"
              >
                Our generator is an advanced educational planning system that leverages next-generation artificial intelligence to construct structured, outcomes-driven course blueprints. By aligning academic guidelines with employer-requested matrices, we help bridge the gap between classroom theory and industry readiness.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-2"
              >
                <button 
                  onClick={() => navigate('/generate')} 
                  className="inline-flex items-center gap-3 px-6 py-3.5 text-xs font-bold text-white gradient-bg rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer btn-premium"
                >
                  <span>Explore Platform</span>
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            </div>

            {/* Right Dashboard Mockup Column */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full flex justify-center lg:justify-end"
              >
                <HeroDashboardMockup />
              </motion.div>
            </div>

          </div>
        </section>

        {/* ── SECTION 2: MISSION & VISION ── */}
        <section className="relative py-16 px-6 z-10 border-b border-border/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Mission Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-card border border-border rounded-3xl shadow-sm hover-lift text-left glass relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mb-5 text-primary">
                  <Award size={22} />
                </div>
                <h3 className="card-heading text-text-primary mb-3">Our Mission</h3>
                <p className="body-text text-text-secondary leading-relaxed font-medium">
                  "To empower educators and institutions with intelligent tools that accelerate curriculum development while maintaining educational excellence."
                </p>
              </motion.div>

              {/* Vision Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 bg-card border border-border rounded-3xl shadow-sm hover-lift text-left glass relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary/8 flex items-center justify-center mb-5 text-secondary">
                  <TrendingUp size={22} />
                </div>
                <h3 className="card-heading text-text-primary mb-3">Our Vision</h3>
                <p className="body-text text-text-secondary leading-relaxed font-medium">
                  "To become the leading AI-powered platform for curriculum innovation and academic planning worldwide."
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── SECTION 3: CURRICULUM GENERATION FLOW ── */}
        <section className="relative py-16 px-6 z-10 border-b border-border/40 bg-card/20">
          <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-4xl font-bold text-text-primary">
                Curriculum Generation Flow
              </h2>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                Track the continuous process from initial criteria mapping to final program export.
              </p>
            </div>

            {/* Steps Flow Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
              {flowSteps.map((stepItem, idx) => {
                const Icon = stepItem.icon
                return (
                  <motion.div
                    key={stepItem.step}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative bg-card border border-border rounded-2xl p-5 shadow-sm text-center flex flex-col justify-between hover:border-primary/40 transition-all group hover:shadow-md"
                  >
                    <div>
                      {/* Step Indicator Connector inside card */}
                      <span className="absolute top-3 right-3 text-[10px] font-black text-border group-hover:text-primary/30 transition-colors">
                        #{stepItem.step}
                      </span>
                      
                      <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center text-primary mx-auto mb-3.5 group-hover:scale-105 transition-transform">
                        <Icon size={18} />
                      </div>
                      
                      <h4 className="text-xs font-extrabold text-text-primary mb-1.5 leading-snug">{stepItem.title}</h4>
                    </div>
                    <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{stepItem.desc}</p>
                    
                    {/* Visual Connector Arrow pointing to next card (on large screens) */}
                    {idx < 5 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 w-6 h-6 items-center justify-center text-border pointer-events-none">
                        <ChevronRight size={14} className="text-border group-hover:text-primary/40 transition-colors" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: WHO CAN USE IT (Redesigned Gallery Layout) ── */}
        <section className="relative py-16 px-6 z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-4xl font-bold text-text-primary">Who Can Use It?</h2>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                Adaptable blueprints tailored for all scales of academic and professional instruction.
              </p>
            </div>

            {/* Gallery-style Grid Layout */}
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((cat, idx) => {
                const Icon = cat.icon
                return (
                  <div key={cat.title} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex">
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="w-full overflow-hidden rounded-3xl border border-border bg-card group shadow-sm transition-all hover-lift flex flex-col justify-between"
                    >
                      {/* Visual Frame */}
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <img 
                          src={cat.img} 
                          alt={cat.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/35" />
                        
                        {/* Category Floating Indicator Badge */}
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                          <Icon size={12} />
                        </div>
                      </div>

                      {/* Minimal Title Block */}
                      <div className="p-4 bg-card border-t border-border/40 text-center">
                        <p className="font-bold text-text-primary text-sm tracking-tight">{cat.title}</p>
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
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
