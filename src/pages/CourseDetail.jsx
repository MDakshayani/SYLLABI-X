import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { BookOpen, CheckCircle, Wrench, Briefcase, Hash } from 'lucide-react'
import useStore from '../store'
import { cn } from '../lib/utils'
import PageTransition from '../components/PageTransition'

const tabs = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'topics', label: 'Topics', icon: Hash },
  { id: 'outcomes', label: 'Outcomes', icon: CheckCircle },
  { id: 'resources', label: 'Resources', icon: Wrench },
]

export default function CourseDetail() {
  const { id } = useParams()
  const { currentRole, facultyCurriculumData, studentCurriculumData } = useStore()
  const curriculum = currentRole === 'faculty' ? facultyCurriculumData : studentCurriculumData
  const [tab, setTab] = useState('overview')

  if (!curriculum) return null

  const allCourses = curriculum.semesters.flatMap(s => s.courses)
  const course = allCourses[parseInt(id)]
  if (!course) return null

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl mx-auto bg-transparent">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shrink-0">
                <BookOpen size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold text-primary bg-primary/8 px-2 py-0.5 rounded">
                    {course.course_code}
                  </span>
                  <span className="text-xs font-bold text-success bg-success/8 border border-success/15 px-2.5 py-0.5 rounded-full">
                    {course.credits} Credits
                  </span>
                </div>
                <h1 className="text-xl font-black text-text-primary mb-1">{course.course_name}</h1>
              </div>
            </div>
          </div>

      {/* Tabs Navigation Bar */}
      <div className="flex gap-1 bg-background rounded-xl p-1 mb-6 border border-border/40">
        {tabs.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            className={cn(
              'flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              tab === tid
                ? 'bg-card text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-2xl border border-border shadow-sm p-6"
        >
          {tab === 'overview' && (
            <div>
              <h3 className="font-bold text-text-primary mb-3">Course Description</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">{course.description}</p>

              <h3 className="font-bold text-text-primary mb-3">Industry Applications</h3>
              <div className="flex flex-wrap gap-2">
                {course.industry_applications.map(a => (
                  <div
                    key={a}
                    className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary"
                  >
                    <Briefcase size={12} className="text-primary" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'topics' && (
            <div>
              <h3 className="font-bold text-text-primary mb-4">Key Topics</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.topics.map((topic, i) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border"
                  >
                    <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-text-primary">{topic}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === 'outcomes' && (
            <div>
              <h3 className="font-bold text-text-primary mb-4">Learning Outcomes</h3>
              <div className="space-y-3">
                {course.learning_outcomes.map((outcome, i) => (
                  <motion.div
                    key={outcome}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border"
                  >
                    <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-text-primary leading-relaxed">{outcome}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === 'resources' && (
            <div>
              <h3 className="font-bold text-text-primary mb-4">Recommended Tools & Resources</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.tools.map((tool, i) => (
                  <motion.div
                    key={tool}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-sm shrink-0">
                      <Wrench size={13} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-text-primary">{tool}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
      </div >
    </PageTransition >
  )
}
