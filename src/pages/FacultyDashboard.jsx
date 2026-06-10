import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, ChevronDown, CheckCircle2, Terminal, Layers, 
  Calendar, FileDown, Clock, Play, AlertCircle, 
  BookOpenCheck, Download, ChevronRight, Lock
} from 'lucide-react'

import useStore from '../store'
import { generateCurriculum, generateCurriculumQuiz } from '../lib/utils'
import { generateQuizFromGroq } from '../lib/quizGroqService'
import { downloadCurriculumPDF } from '../lib/pdfGenerator'
import PageTransition from '../components/PageTransition'
import PDFExportModal from '../components/PDFExportModal'

const selectCls = "w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium"

export default function FacultyDashboard() {
  const navigate = useNavigate()
  const {
    setCurrentRole,
    facultyCurriculumData: curriculum,
    setFacultyCurriculumData: setCurriculum,
    facultyHistoryData: history,
    addFacultyHistoryData: addToHistory,
    loadFacultyHistoryData: loadHistory,
    deleteFacultyHistoryData: deleteFromHistory,
    facultyQuizData: quizQuestions,
    setFacultyQuizData: setQuizQuestions
  } = useStore()
  
  const [activeTab, setActiveTab] = useState('generator')
  const [form, setForm] = useState({
    skill: '',
    customSkill: '',
    level: '',
    semesters: '',
    weeklyHours: '',
    industryFocus: '',
    customIndustry: '',
    curriculumType: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [loadStep, setLoadStep] = useState(0)

  // Quiz Form State
  const [quizForm, setQuizForm] = useState({
    count: '5',
    customCount: '',
    difficulty: 'Medium',
    types: ['MCQ', 'True/False', 'Short Answer', 'Scenario Based', 'Application Based', 'Descriptive', 'Fill in the Blanks'],
    quizMode: 'Unit Test',
    examStyle: false
  })
  const [quizLoading, setQuizLoading] = useState(false)
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState(null)
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

  useEffect(() => {
    setCurrentRole('faculty')
    if (loadHistory) loadHistory()
    // Always start a fresh generation session on portal mount unless navigating via history load
    setCurriculum(null)
  }, [loadHistory, setCurrentRole, setCurriculum])

  const handleFieldChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleTypeToggle = (type) => {
    setQuizForm(q => {
      const exists = q.types.includes(type)
      const newTypes = exists 
        ? q.types.filter(t => t !== type)
        : [...q.types, type]
      return { ...q, types: newTypes }
    })
  }

  const handleGenerateCurriculum = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLoadStep(0)
    
    const intervals = [600, 1400, 2200, 3000]
    intervals.forEach((time, index) => {
      setTimeout(() => setLoadStep(index + 1), time)
    })

    await new Promise(r => setTimeout(r, 3400))
    
    // Resolve custom overrides
    const finalSkill = form.skill === 'Other' ? (form.customSkill || 'Custom Skill') : form.skill
    const finalIndustry = form.industryFocus === 'Other Industry' ? (form.customIndustry || 'Custom Focus') : form.industryFocus

    const result = generateCurriculum({
      ...form,
      skill: finalSkill,
      industryFocus: finalIndustry
    })
    
    setCurriculum(result)
    addToHistory(result)
    setLoading(false)
  }

  // Quiz creation
  const handleGenerateQuiz = async (e) => {
    e.preventDefault()
    if (!curriculum) return
    if (quizForm.types.length === 0) return
    setQuizLoading(true)

    const finalCount = quizForm.count === 'Custom' 
      ? parseInt(quizForm.customCount) || 5 
      : parseInt(quizForm.count)

    try {
      const questions = await generateQuizFromGroq(
        curriculum,
        finalCount,
        quizForm.difficulty,
        quizForm.types,
        quizForm.quizMode,
        quizForm.examStyle
      )
      setQuizQuestions(questions)
    } catch (err) {
      console.error("Groq API quiz generation failed, falling back to offline generator:", err)
      const questions = generateCurriculumQuiz(
        curriculum,
        finalCount,
        quizForm.difficulty,
        quizForm.types,
        quizForm.quizMode,
        quizForm.examStyle
      )
      setQuizQuestions(questions)
    } finally {
      setQuizLoading(false)
    }
  }

  const handleDownloadQuestionPaper = () => {
    if (!quizQuestions) return
    let content = `====================================================\n`
    content += `${curriculum.program_name} - QUESTION PAPER\n`
    content += `Difficulty: ${quizForm.difficulty} | Exam Type: ${quizForm.quizMode || 'General Exam'}\n`
    content += `====================================================\n\n`
    
    quizQuestions.forEach((q, idx) => {
      content += `${idx + 1}. [${q.type}] ${q.question}\n`
      if (q.type === 'MCQ' || q.type === 'True/False' || q.type === 'Scenario Based') {
        q.options.forEach(opt => {
          content += `   ${opt}\n`
        })
      } else if (q.type === 'Fill in the Blanks') {
        content += `   Fill in the blank space.\n`
      } else {
        content += `   Response space:\n\n\n`
      }
      content += `\n----------------------------------------------------\n\n`
    })
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${curriculum.program_name.replace(/\s+/g, '_')}_Question_Paper.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadAnswerKey = () => {
    if (!quizQuestions) return
    let content = `====================================================\n`
    content += `${curriculum.program_name} - ANSWER KEY\n`
    content += `Difficulty: ${quizForm.difficulty} | Exam Type: ${quizForm.quizMode || 'General Exam'}\n`
    content += `====================================================\n\n`
    
    quizQuestions.forEach((q, idx) => {
      content += `${idx + 1}. [${q.type}] ${q.question}\n`
      if (q.type === 'MCQ' || q.type === 'True/False' || q.type === 'Scenario Based') {
        q.options.forEach((opt, oIdx) => {
          const isCorrect = oIdx === q.correct
          content += `   ${opt} ${isCorrect ? ' [ CORRECT ANSWER ]' : ''}\n`
        })
      } else if (q.type === 'Fill in the Blanks') {
        content += `   Expected Blank Word: ${q.expectedConcept || q.options[0]}\n`
      } else {
        content += `   Expected Guide / Rubric: ${q.options[0] || q.expectedConcept}\n`
      }
      content += `   Explanation: ${q.explanation}\n`
      content += `\n----------------------------------------------------\n\n`
    })
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${curriculum.program_name.replace(/\s+/g, '_')}_Answer_Key.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row relative z-10 text-text-primary bg-transparent">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/40 backdrop-blur-md p-6 flex flex-col gap-2 shrink-0 text-left">
          <div className="mb-6 px-2">
            <h2 className="text-sm font-extrabold text-primary uppercase tracking-widest">Faculty Workspace</h2>
            <p className="text-[10px] text-text-secondary mt-1">Academic outline & Syllabus designer</p>
          </div>

          {[
            { id: 'generator', label: 'SyllabiX Builder', icon: Sparkles },
            { id: 'quiz', label: curriculum ? 'Quiz Generator' : 'Quiz Generator 🔒', icon: BookOpenCheck },
            { id: 'history', label: 'History Logs', icon: Clock },
            { id: 'exports', label: 'Exports Manager', icon: FileDown }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-text-secondary hover:bg-primary/8 hover:text-primary'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </aside>

        {/* Dashboard Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab !== 'generator' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2 text-left">
              <button 
                onClick={() => setActiveTab('generator')} 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-card border border-border hover:border-primary/45 hover:text-primary rounded-xl text-xs font-bold transition-all cursor-pointer mb-4"
              >
                ← Back
              </button>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            
            {/* ── 1. CURRICULUM GENERATOR TAB ── */}
            {activeTab === 'generator' && (
              <motion.div
                key="generator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 text-left"
              >
                {!curriculum && !loading && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <h1 className="text-xl md:text-2xl font-black text-text-primary">Curriculum Designer</h1>
                      <p className="text-xs text-text-secondary mt-1">Select domains, target focus, and build unit-wise curriculum roadmaps.</p>
                    </div>

                    <form onSubmit={handleGenerateCurriculum} className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                      <div className="grid sm:grid-cols-2 gap-5">
                        
                        {/* Domain Field */}
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Skill / Domain</label>
                          <div className="relative">
                            <select className={selectCls} value={form.skill} onChange={handleFieldChange('skill')} required>
                              <option value="" disabled>Select Skill / Domain</option>
                              {['Machine Learning', 'Web Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'DevOps', 'Blockchain', 'Other'].map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        {/* Custom Skill Input */}
                        {form.skill === 'Other' && (
                          <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Enter Custom Skill / Domain</label>
                            <input
                              type="text"
                              value={form.customSkill}
                              onChange={handleFieldChange('customSkill')}
                              placeholder="e.g. Quantum Computing"
                              required
                              className={inputCls}
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Education Level</label>
                          <div className="relative">
                            <select className={selectCls} value={form.level} onChange={handleFieldChange('level')} required>
                              <option value="" disabled>Select Education Level</option>
                              {['Certificate', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Bootcamp'].map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Semesters</label>
                          <div className="relative">
                            <select className={selectCls} value={form.semesters} onChange={handleFieldChange('semesters')} required>
                              <option value="" disabled>Select Number of Semesters</option>
                              {['2', '4', '6', '8'].map(o => (
                                <option key={o} value={o}>{o} Semesters</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Weekly Hours</label>
                          <div className="relative">
                            <select className={selectCls} value={form.weeklyHours} onChange={handleFieldChange('weeklyHours')} required>
                              <option value="" disabled>Select Weekly Study Hours</option>
                              {['10', '15', '20', '30', '40'].map(o => (
                                <option key={o} value={o}>{o} hrs/week</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        {/* Industry Field */}
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Industry Focus</label>
                          <div className="relative">
                            <select className={selectCls} value={form.industryFocus} onChange={handleFieldChange('industryFocus')} required>
                              <option value="" disabled>Select Industry Focus</option>
                              {[
                                'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 
                                'Retail', 'Telecommunications', 'Automotive', 'Aerospace', 'Cybersecurity', 
                                'Cloud Computing', 'Artificial Intelligence', 'Data Science', 'E-Commerce', 
                                'Government', 'Research & Development', 'Energy', 'Biotechnology', 'Media', 
                                'Agriculture', 'Construction', 'Logistics', 'Sports Analytics', 'Gaming', 
                                'IoT', 'Robotics', 'Other Industry'
                              ].map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        {/* Custom Industry Input */}
                        {form.industryFocus === 'Other Industry' && (
                          <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Enter Custom Industry Focus</label>
                            <input
                              type="text"
                              value={form.customIndustry}
                              onChange={handleFieldChange('customIndustry')}
                              placeholder="e.g. Robotics & Automation"
                              required
                              className={inputCls}
                            />
                          </div>
                        )}

                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Curriculum Type</label>
                          <div className="relative">
                            <select className={selectCls} value={form.curriculumType} onChange={handleFieldChange('curriculumType')} required>
                              <option value="" disabled>Select Curriculum Type</option>
                              {['Theory Only', 'Theory + Practical', 'Project-Based', 'Industry-Integrated'].map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all text-xs cursor-pointer btn-premium"
                      >
                        <Sparkles size={14} />
                        <span>Generate Academic Program Outline</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Synthesis Loading Screen */}
                {loading && (
                  <div className="w-full max-w-xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden select-none">
                    <div className="absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse" />
                    
                    <div className="flex items-center gap-4 border-b border-border pb-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Play size={20} className="animate-spin text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-text-primary">AI Synthesizer Loading...</h3>
                        <p className="text-[10px] text-text-secondary font-semibold mt-0.5">Creating semester sequencing...</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Structuring progressive curriculum semesters', icon: Terminal },
                        { label: 'Building unit-by-unit outline modules (max 5 per sem)', icon: Layers },
                        { label: 'Mapping cognitive Bloom\'s level taxonomy badges', icon: Calendar },
                        { label: 'Attaching specific papers, books and web resources', icon: CheckCircle2 }
                      ].map((item, index) => {
                        const Icon = item.icon
                        const isDone = loadStep > index
                        const isActive = loadStep === index

                        return (
                          <div 
                            key={index}
                            className={`flex items-center gap-3.5 text-xs font-semibold transition-opacity duration-300 ${isDone || isActive ? 'opacity-100' : 'opacity-30'}`}
                          >
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                              isDone 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                : isActive 
                                  ? 'bg-primary/10 border-primary/20 text-primary animate-pulse'
                                  : 'bg-card border-border text-text-secondary'
                            }`}>
                              {isDone ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                            </div>
                            <span className={isDone ? 'line-through text-text-secondary' : 'text-text-primary'}>
                              {item.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Curriculum Render Preview */}
                {curriculum && !loading && (
                  <div className="space-y-8">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">{curriculum.education_level} Program</p>
                        <h1 className="text-2xl font-black text-text-primary">{curriculum.program_name}</h1>
                        <p className="text-xs text-text-secondary mt-0.5">{curriculum.program_duration} · {curriculum.industry_focus} Focus · {curriculum.weekly_hours} hrs/week</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurriculum(null)}
                          className="px-4 py-2.5 bg-card border border-border text-xs font-bold rounded-xl hover:border-primary/40 text-text-secondary hover:text-primary transition-all cursor-pointer"
                        >
                          Reset / New Plan
                        </button>
                        <button
                          onClick={() => setActiveTab('exports')}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer btn-premium"
                        >
                          <FileDown size={13} />
                          <span>Export Options</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-text-secondary uppercase">Total Credits</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.stats.totalCredits}</p>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-text-secondary uppercase">Total Units</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.stats.totalUnits}</p>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase">Alignment Score</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.alignment_score}%</p>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-primary uppercase">Quality Score</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.quality_score}%</p>
                      </div>
                    </div>

                    {/* Quality scoreboard & Gaps */}
                    <div className="grid lg:grid-cols-[40fr_60fr] gap-6">
                      
                      {/* Metric scores */}
                      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 text-left">
                        <h3 className="text-sm font-bold text-text-primary">Quality Scoreboard</h3>
                        <div className="space-y-3">
                          {[
                            { label: 'Comprehensiveness', value: curriculum.quality_metrics?.comprehensiveness || 92 },
                            { label: 'Industry Relevance', value: curriculum.quality_metrics?.industryRelevance || 95 },
                            { label: 'Logical Sequencing', value: curriculum.quality_metrics?.logicalStructure || 88 }
                          ].map(metric => (
                            <div key={metric.label} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-text-secondary">{metric.label}</span>
                                <span className="text-text-primary">{metric.value}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${metric.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-[10px] font-bold text-text-secondary uppercase">Tech Tags Mapped</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {curriculum.tech_coverage?.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-background border border-border rounded text-[9px] font-semibold text-text-secondary">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Skill Gaps identified */}
                      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 text-left">
                        <div className="flex items-center gap-2 text-amber-500">
                          <AlertCircle size={15} />
                          <h3 className="text-sm font-bold">Industry Skill Gaps Mapped</h3>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          AI compared outline tags with active developer competencies. Gaps list:
                        </p>
                        <ul className="space-y-2 pt-1">
                          {curriculum.skill_gaps?.map((gap, gIdx) => (
                            <li key={gIdx} className="text-xs font-medium text-text-secondary flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Semester & Unit roadmaps */}
                    <div className="space-y-6">
                      <h2 className="text-lg font-extrabold text-text-primary">Curriculum Roadmap Structure</h2>
                      
                      <div className="space-y-8 pl-4 border-l border-border relative">
                        {curriculum.semesters.map((sem, sIdx) => (
                          <div key={sem.semester_number} className="relative space-y-4">
                            {/* Roadmap bullet */}
                            <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm" />
                            
                            <div className="text-left flex justify-between items-center gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-primary uppercase bg-primary/8 px-2 py-0.5 rounded-lg">
                                  Semester {sem.semester_number}
                                </span>
                                <h3 className="text-base font-extrabold text-text-primary mt-1">{sem.theme}</h3>
                              </div>
                              <button
                                onClick={() => navigate(`/curriculum/semester/${sIdx}`)}
                                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Detail View</span>
                                <ChevronRight size={13} />
                              </button>
                            </div>

                            {/* Units in this Semester */}
                            <div className="grid md:grid-cols-2 gap-5">
                              {sem.units.map((unit) => (
                                <div 
                                  key={unit.unit_number} 
                                  onClick={() => navigate(`/curriculum/semester/${sIdx}`)}
                                  className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm hover-lift cursor-pointer text-left"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-mono font-bold text-primary bg-primary/8 px-1.5 py-0.5 rounded">
                                          Unit {unit.unit_number}
                                        </span>
                                        <span className="text-[9px] font-bold text-secondary bg-secondary/8 border border-secondary/15 px-1.5 py-0.5 rounded-full">
                                          {unit.blooms_taxonomy}
                                        </span>
                                      </div>
                                      <h4 className="font-bold text-sm text-text-primary mt-1.5">{unit.name}</h4>
                                      <p className="text-[11px] text-text-secondary leading-relaxed mt-2 line-clamp-2">{unit.description}</p>
                                    </div>
                                  </div>

                                  <div className="h-px bg-border/60" />

                                  <div className="flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>📚</span>
                                      <span>{unit.topics?.length || 0} Topics</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>🎯</span>
                                      <span>{unit.learning_outcomes?.length || 0} Outcomes</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>📖</span>
                                      <span>{(() => {
                                        let rc = 0;
                                        if (unit.resources) {
                                          if (unit.resources.youtube) rc++;
                                          if (unit.resources.google) rc++;
                                          if (unit.resources.research_paper) rc++;
                                          if (unit.resources.github) rc++;
                                          if (unit.resources.book) rc++;
                                        }
                                        return rc;
                                      })()} Resources</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>🧪</span>
                                      <span>{unit.practice_activities?.length || 0} Activities</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>📝</span>
                                      <span>{unit.assessments?.length || 0} Assessments</span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </motion.div>
            )}

            {/* ── 2. QUIZ GENERATOR TAB ── */}
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-4xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">Quiz Constructor</h1>
                  <p className="text-xs text-text-secondary mt-1">Configure questions based on semester units and review options directly.</p>
                </div>

                {!curriculum ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-xl mx-auto space-y-6 bg-card border border-border rounded-3xl shadow-xl mt-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
                        <Lock size={36} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-card text-xs font-bold">
                        🔒
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-xl font-extrabold text-text-primary">No Curriculum Available</h2>
                      <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
                        Quiz generation requires an active curriculum. Generate a curriculum first and then create AI-powered quizzes based on your syllabus.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('generator')}
                      className="px-6 py-3 gradient-bg text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-xs btn-premium"
                    >
                      Generate Curriculum
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-[35fr_65fr] gap-6">
                    
                    {/* Setup Quiz Form */}
                    <form onSubmit={handleGenerateQuiz} className="bg-card border border-border rounded-2xl p-5 space-y-4 h-fit shadow-sm">
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Quiz Parameters</h3>
                      
                      {/* Question Count */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Question Count</label>
                        <div className="relative">
                          <select 
                            className={selectCls} 
                            value={quizForm.count} 
                            onChange={e => setQuizForm(q => ({ ...q, count: e.target.value }))}
                          >
                            {['5', '10', '15', '20', '25', '30', '55', 'Custom'].map(cnt => (
                              <option key={cnt} value={cnt}>{cnt} Questions</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                        </div>
                      </div>

                      {/* Custom Question Count input */}
                      {quizForm.count === 'Custom' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-primary uppercase">Number of Questions</label>
                          <input
                            type="number"
                            value={quizForm.customCount}
                            onChange={e => setQuizForm(q => ({ ...q, customCount: e.target.value }))}
                            placeholder="e.g. 40"
                            min="1"
                            required
                            className={inputCls}
                          />
                        </div>
                      )}

                      {/* Difficulty */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Difficulty</label>
                        <div className="relative">
                          <select 
                            className={selectCls} 
                            value={quizForm.difficulty} 
                            onChange={e => setQuizForm(q => ({ ...q, difficulty: e.target.value }))}
                          >
                            {['Easy', 'Medium', 'Hard'].map(dif => (
                              <option key={dif} value={dif}>{dif}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                        </div>
                      </div>

                      {/* Quiz Mode / Type */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Quiz Mode</label>
                        <div className="relative">
                          <select 
                            className={selectCls} 
                            value={quizForm.quizMode} 
                            onChange={e => setQuizForm(q => ({ ...q, quizMode: e.target.value }))}
                          >
                            {['Unit Test', 'Mid Exam', 'Semester Exam', 'Assignment Questions', 'Practice Questions', 'Viva Questions'].map(mode => (
                              <option key={mode} value={mode}>{mode}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                        </div>
                      </div>

                      {/* Exam Style */}
                      <label className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl cursor-pointer text-[11px] font-semibold hover:border-primary/30 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={quizForm.examStyle}
                          onChange={e => setQuizForm(q => ({ ...q, examStyle: e.target.checked }))}
                          className="rounded text-primary focus:ring-primary/30 border-border bg-card cursor-pointer"
                        />
                        <span className="text-text-primary">Exam Style Mode</span>
                      </label>

                      {/* Question Types Checkboxes */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Question Types</label>
                        <div className="space-y-1.5">
                           {['MCQ', 'True/False', 'Short Answer', 'Long Answer', 'Descriptive', 'Scenario Based', 'Application Based', 'Case Study', 'Interview Style', 'Fill in the Blanks'].map(type => {
                            const isChecked = quizForm.types.includes(type)
                            return (
                              <label key={type} className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl cursor-pointer text-[11px] font-semibold hover:border-primary/30 transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => handleTypeToggle(type)}
                                  className="rounded text-primary focus:ring-primary/30 border-border bg-card cursor-pointer"
                                />
                                <span className="text-text-primary">{type}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={quizLoading || quizForm.types.length === 0}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-95 disabled:opacity-50 transition-all text-xs cursor-pointer btn-premium"
                      >
                        {quizLoading ? 'Generating Questions...' : 'Generate Quiz'}
                      </button>

                    </form>

                  {/* Quiz Preview */}
                  <div className="space-y-6">
                    {quizLoading && (
                      <div className="bg-card border border-border rounded-2xl p-6 text-center py-20">
                        <Clock className="animate-spin text-primary mx-auto mb-3" size={24} />
                        <p className="text-xs font-bold text-text-primary">Generating questions...</p>
                        <p className="text-[10px] text-text-secondary mt-1">Integrating MCQ, True/False, Scenario and Short formats.</p>
                      </div>
                    )}

                    {!quizLoading && quizQuestions && (
                      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border pb-3 gap-3">
                          <div>
                            <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">
                              Active Quiz Questions ({quizQuestions.length})
                            </span>
                            <h3 className="font-bold text-sm text-text-primary mt-1">{curriculum.program_name}</h3>
                            <p className="text-[10px] text-text-secondary mt-0.5">Difficulty: {quizForm.difficulty} · Mode: {quizForm.quizMode}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={handleDownloadQuestionPaper}
                              className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Download Paper
                            </button>
                            <button
                              onClick={handleDownloadAnswerKey}
                              className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Download Key
                            </button>
                            <button
                              onClick={() => setQuizQuestions(null)}
                              className="px-2.5 py-1.5 bg-background border border-border text-[10px] font-bold rounded-lg hover:border-red-500/20 hover:text-red-500 cursor-pointer transition-colors"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* Questions list */}
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                          {quizQuestions.map((q, idx) => (
                            <div key={q.id} className="space-y-2.5 text-xs border-b border-border/40 pb-4 last:border-b-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-text-primary">{idx + 1}.</span>
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-[4px] text-[8px] font-bold uppercase">{q.type}</span>
                              </div>
                              <p className="font-semibold text-text-primary pl-2">{q.question}</p>
                              
                              {q.options.length > 1 ? (
                                <div className="grid grid-cols-1 gap-1.5 pl-4">
                                  {q.options.map((opt, oIdx) => (
                                    <div 
                                      key={oIdx} 
                                      className={`p-2.5 rounded-xl border text-[11px] font-medium ${
                                        oIdx === q.correct 
                                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                                          : 'bg-background border-border text-text-secondary'
                                      }`}
                                    >
                                      {opt} {oIdx === q.correct && '✓ (Answer Key)'}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="pl-4 mt-1.5">
                                  <span className="text-[9px] font-bold text-text-secondary uppercase">Expected Guide / Rubric:</span>
                                  <p className="text-[10px] mt-0.5 text-emerald-600 dark:text-emerald-400 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                    {q.options[0]}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!quizQuestions && !quizLoading && (
                      <div className="bg-card border border-border rounded-2xl p-6 text-center py-24 text-text-secondary">
                        <BookOpenCheck size={32} className="mx-auto mb-3 text-primary animate-pulse" />
                        <p className="text-xs font-bold">No quiz generated yet.</p>
                        <p className="text-[10px] mt-1">Select scope parameters on the left to synthesize study exam sets.</p>
                      </div>
                    )}

                  </div>

                </div>
              )}
              </motion.div>
            )}



            {/* ── 4. HISTORY LOGS TAB ── */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-4xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">Academic History Log</h1>
                  <p className="text-xs text-text-secondary mt-1">Manually inspect and reload previously generated academic blueprints.</p>
                </div>

                {history.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-8 py-20 text-center">
                    <AlertCircle size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-text-secondary font-bold">No academic curricula generated yet by this user.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-card border border-border rounded-2xl shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-card/60">
                          <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Curriculum Name</th>
                          <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Domain</th>
                          <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Industry</th>
                          <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date Generated</th>
                          <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/65">
                        {history.map(item => (
                          <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 text-xs font-bold text-text-primary">{item.program_name}</td>
                            <td className="p-4 text-xs font-semibold text-text-secondary">{item.skill}</td>
                            <td className="p-4 text-xs font-semibold text-text-secondary">{item.industry_focus}</td>
                            <td className="p-4 text-xs font-medium text-text-secondary">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-xs text-right space-x-2 shrink-0">
                              <button
                                onClick={() => {
                                  setCurriculum(item)
                                  setActiveTab('generator')
                                }}
                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirmId(item.id)}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </motion.div>
            )}

            {/* ── 5. EXPORTS TAB ── */}
            {activeTab === 'exports' && (
              <motion.div
                key="exports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-2xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">Exports Manager</h1>
                  <p className="text-xs text-text-secondary mt-1">Download generated academic handbooks and syllabus files.</p>
                </div>

                {curriculum ? (
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                    <div className="border-b border-border pb-4">
                      <h3 className="font-bold text-sm text-text-primary">{curriculum.program_name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Prepared for {curriculum.industry_focus} workflows</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      
                      <div 
                        onClick={handleDownloadPDF}
                        className={`bg-background border border-border rounded-xl p-5 hover-lift cursor-pointer space-y-3 ${
                          pdfDownloading ? 'opacity-70 pointer-events-none' : ''
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Download size={16} className={pdfDownloading ? 'animate-bounce' : ''} />
                        </div>
                        <h4 className="font-bold text-xs text-text-primary">
                          {pdfDownloading ? 'Generating PDF...' : 'Download PDF Handbook'}
                        </h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed">Download structured cover pages and unit-wise tables ready for accreditation.</p>
                      </div>

                      <div 
                        onClick={() => {
                          const fileData = JSON.stringify(curriculum, null, 2)
                          const blob = new Blob([fileData], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `${curriculum.program_name.replace(/\s+/g, '_')}_curriculum.json`
                          link.click()
                          URL.revokeObjectURL(url)
                        }}
                        className="bg-background border border-border rounded-xl p-5 hover-lift cursor-pointer space-y-3"
                      >
                        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                          <Terminal size={16} />
                        </div>
                        <h4 className="font-bold text-xs text-text-primary">Export JSON Schema</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed">Integrate structured syllabus data configurations inside external LMS software.</p>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-6 text-center py-12">
                    <AlertCircle size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-text-secondary font-bold">Generate a curriculum plan first to enable Export options.</p>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </main>
        <AnimatePresence>
          {showDeleteConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirmId(null)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              
              {/* Modal Container */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 space-y-6 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-text-primary">Delete Curriculum?</h3>
                    <p className="text-xs text-text-secondary mt-1">This action cannot be undone and will permanently remove this curriculum from your history logs.</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirmId(null)}
                    className="px-4 py-2 bg-background border border-border text-xs font-bold rounded-xl text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteFromHistory(showDeleteConfirmId)
                      setShowDeleteConfirmId(null)
                    }}
                    className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
