import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Award, Layers, Hash, Download, Sparkles, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'
import useStore from '../store'
import PageTransition from '../components/PageTransition'
import { downloadCurriculumPDF } from '../lib/pdfGenerator'
import PDFExportModal from '../components/PDFExportModal'

export default function CurriculumPreview() {
  const navigate = useNavigate()
  const { currentRole, facultyCurriculumData, studentCurriculumData } = useStore()
  const curriculum = currentRole === 'faculty' ? facultyCurriculumData : studentCurriculumData

  const [pdfSuccess, setPdfSuccess] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const [pdfDownloading, setPdfDownloading] = useState(false)
  const [pendingPDF, setPendingPDF] = useState(null)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const handleDownloadPDF = async () => {
    if (!curriculum) return
    setPdfDownloading(true)
    setPdfError(null)
    setPdfSuccess(false)
    try {
      const generated = await downloadCurriculumPDF(curriculum)
      setPendingPDF(generated)
      setIsExportOpen(true)
      setPdfSuccess(true)
      setTimeout(() => setPdfSuccess(false), 4000)
    } catch (err) {
      console.error('PDF generation error:', err)
      setPdfError('PDF generation failed. Please try again.')
      setTimeout(() => setPdfError(null), 5000)
    } finally {
      setPdfDownloading(false)
    }
  }

  if (!curriculum) return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-full py-24 text-center select-none relative z-10 text-text">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
          <Sparkles size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">No curriculum found</h2>
        <p className="text-text-secondary mb-6 text-sm">Configure and generate a custom program pathway first.</p>
        <button 
          onClick={() => navigate('/generate')} 
          className="px-6 py-3 gradient-bg text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer btn-premium text-sm"
        >
          <span>Generate Curriculum</span>
        </button>
      </div>
    </PageTransition>
  )

  const { program_name, program_duration, education_level, industry_focus, weekly_hours, program_objectives, career_paths, certifications, semesters, capstone_project, stats } = curriculum

  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto space-y-8 bg-transparent relative z-10 text-text">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-start justify-between gap-4 text-left">
          <div>
            <p className="text-xs font-extrabold text-primary mb-1.5 uppercase tracking-widest">{education_level} Program</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary leading-tight mb-1">{program_name}</h1>
            <p className="text-text-secondary text-sm font-semibold">{program_duration} · {industry_focus} Focus · {weekly_hours} hrs/week</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfDownloading}
              className={`flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-text-primary text-xs font-bold rounded-xl hover:border-primary/45 hover:bg-primary/8 hover:text-primary transition-all cursor-pointer shadow-sm btn-premium ${
                pdfDownloading ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              <Download size={13} className={pdfDownloading ? 'animate-bounce' : ''} />
              <span>{pdfDownloading ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>
            <button
              onClick={() => navigate('/generate')}
              className="flex items-center gap-2 px-4 py-2.5 gradient-bg text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer btn-premium"
            >
              <Sparkles size={13} />
              <span>Regenerate</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Units', value: stats.totalUnits || (semesters.length * 5), icon: BookOpen, color: 'var(--accent-color)' },
            { label: 'Total Credits', value: stats.totalCredits, icon: Award, color: 'var(--secondary-color-val)' },
            { label: 'Topics Covered', value: stats.totalTopics, icon: Hash, color: 'var(--accent-color-val)' },
            { label: 'Semesters', value: semesters.length, icon: Layers, color: '#10B981' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-sm text-left transition-all hover:border-primary/35 hover:shadow-lg"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="text-2xl font-black text-text-primary">{value}</p>
              <p className="text-xs font-bold text-text-secondary mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Informational Cards Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Objectives */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-sm p-6 text-left"
          >
            <h3 className="font-bold text-text-primary text-sm mb-4">Program Objectives</h3>
            <ul className="space-y-3">
              {program_objectives.map(obj => (
                <li key={obj} className="flex items-start gap-2.5 text-xs font-semibold text-text-secondary">
                  <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Career Paths & Certifications */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border shadow-sm p-6 text-left"
          >
            <h3 className="font-bold text-text-primary text-sm mb-4">Target Career Roles</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {career_paths.map(c => (
                <span key={c} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary/8 text-primary border border-primary/15">
                  {c}
                </span>
              ))}
            </div>
            <h3 className="font-bold text-text-primary text-sm mb-3">Recommended Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {certifications.map(c => (
                <span key={c} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-amber-500/8 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                  {c}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Capstone Project */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border shadow-sm p-6 gradient-card text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                  <Award size={13} className="text-white animate-pulse" />
                </div>
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Capstone Project</span>
              </div>
              <h3 className="font-bold text-text-primary text-sm mb-2">{capstone_project.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">{capstone_project.description}</p>
            </div>
            
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              {capstone_project.deliverables.map(d => (
                <div key={d} className="flex items-center gap-2 text-[10px] font-semibold text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Semesters Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="space-y-5 text-left"
        >
          <h2 className="font-extrabold text-text-primary text-lg">Semester Roadmap Breakdown</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {semesters.map((sem, i) => (
              <motion.div
                key={sem.semester_number}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => navigate(`/curriculum/semester/${i}`)}
                className="bg-card border border-border rounded-3xl p-5 hover-lift cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/10 text-white text-xs font-black">
                        S{sem.semester_number}
                      </div>
                      <div>
                        <p className="font-extrabold text-text-primary text-xs">Semester {sem.semester_number}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wide mt-0.5">{sem.theme}</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 my-3">
                    {sem.units.map(unit => (
                      <span key={unit.unit_number} className="px-2 py-0.5 bg-bg-secondary border border-border rounded-md text-[9px] font-bold text-text-secondary">
                        Unit {unit.unit_number}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 text-[10px] font-bold text-text-secondary pt-3 border-t border-border">
                  <span>{sem.units.length} Units</span>
                  <span>•</span>
                  <span>{sem.credits} Credits</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* PDF Toast Alerts */}
        <AnimatePresence>
          {pdfSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/20 text-xs"
            >
              <CheckCircle2 size={16} />
              <span>✓ Curriculum PDF generated successfully</span>
            </motion.div>
          )}
          {pdfError && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 bg-rose-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-3 border border-rose-400/20 text-xs"
            >
              <AlertCircle size={16} />
              <span>{pdfError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* In-App PDF Preview and Export Modal */}
        {isExportOpen && (
          <PDFExportModal 
            isOpen={isExportOpen} 
            onClose={() => setIsExportOpen(false)} 
            pdfData={pendingPDF} 
            title="Academic Syllabus & Curriculum Export" 
          />
        )}

      </div>
    </PageTransition>
  )
}
