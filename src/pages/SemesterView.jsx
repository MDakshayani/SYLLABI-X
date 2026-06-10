import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, BookOpen, Award, ChevronRight, ChevronDown, ChevronUp, 
  CheckCircle2, ClipboardList, Briefcase, Play, FileText, 
  Code, Wrench, Check 
} from 'lucide-react'
import useStore from '../store'
import PageTransition from '../components/PageTransition'

export default function SemesterView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentRole, facultyCurriculumData, studentCurriculumData } = useStore()
  const curriculum = currentRole === 'faculty' ? facultyCurriculumData : studentCurriculumData
  const [expandedUnits, setExpandedUnits] = useState({})

  if (!curriculum) return null
  const semIndex = parseInt(id)
  const sem = curriculum.semesters[semIndex]
  if (!sem) return null

  const toggleUnit = (unitNum) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitNum]: !prev[unitNum]
    }))
  }

  return (
    <PageTransition>
      <div className="p-8 max-w-5xl mx-auto bg-transparent relative z-10 text-text text-left">

        {/* Semester Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border shadow-xl p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg text-white font-black text-lg shrink-0">
              S{sem.semester_number}
            </div>
            <div>
              <h1 className="text-2xl font-black text-text-primary">Semester {sem.semester_number} Detail</h1>
              <p className="text-sm text-primary font-bold">{sem.theme}</p>
            </div>
          </div>
          <div className="flex gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-background border border-border rounded-xl">
              <Award size={13} className="text-secondary" />
              <span>{sem.credits} Credits</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-background border border-border rounded-xl">
              <BookOpen size={13} className="text-primary" />
              <span>{sem.units.length} Units</span>
            </div>
          </div>
        </motion.div>

        {/* Learning Outcomes & Project Details */}
        <div className="grid md:grid-cols-[60fr_40fr] gap-8 mb-8">
          
          {/* Outcomes */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <CheckCircle2 size={15} className="text-primary" />
              <span>Semester Learning Outcomes</span>
            </h3>
            <ul className="space-y-3">
              {sem.learning_outcomes.map((lo, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2.5 text-xs font-semibold text-text-secondary">
                  <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                  <span>{lo}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Project & Assessment Scheme */}
          <div className="space-y-4">
            {sem.projects && sem.projects[0] && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
                <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                  <Briefcase size={13} className="text-secondary" />
                  <span>Milestone Project</span>
                </h4>
                <p className="font-bold text-xs text-text-primary">{sem.projects[0].title}</p>
                <p className="text-[11px] text-text-secondary leading-relaxed">{sem.projects[0].description}</p>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                <ClipboardList size={13} className="text-primary" />
                <span>Evaluation Strategy</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sem.assessments.map((ass, aIdx) => (
                  <span key={aIdx} className="px-2.5 py-1 bg-background border border-border rounded-lg text-[10px] font-bold text-text-secondary">
                    {ass}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Units Timeline List */}
        <div className="space-y-5">
          <h2 className="font-extrabold text-text-primary text-lg">Unit Roadmap Breakdown</h2>
          
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-secondary/20 to-transparent" />
            
            <div className="space-y-5 pl-14">
              {sem.units.map((unit, i) => {
                const isExpanded = !!expandedUnits[unit.unit_number]
                return (
                  <motion.div
                    key={unit.unit_number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative"
                  >
                    {/* Timeline bullet */}
                    <div className="absolute -left-[41px] top-6 w-3 h-3 rounded-full border-2 border-primary bg-background shadow-sm z-10" />

                    <div
                      onClick={() => toggleUnit(unit.unit_number)}
                      className={`bg-card rounded-2xl border border-border p-5 hover-lift cursor-pointer group text-left transition-all ${
                        isExpanded ? 'ring-1 ring-primary/25 border-primary/40 shadow-md' : 'shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded">
                              Unit {unit.unit_number}
                            </span>
                            <span className="text-[9px] font-bold text-secondary bg-secondary/8 border border-secondary/15 px-2 py-0.5 rounded-full">
                              Bloom: {unit.blooms_taxonomy}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">{unit.name}</h3>
                          <p className="text-xs text-text-secondary leading-relaxed mt-2">{unit.description}</p>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-background border border-border group-hover:border-primary/30 transition-colors shrink-0 mt-1">
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-text-secondary group-hover:text-primary" />
                          ) : (
                            <ChevronDown size={14} className="text-text-secondary group-hover:text-primary" />
                          )}
                        </div>
                      </div>

                      {!isExpanded && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                            <span>📚</span>
                            <span>{unit.topics?.length || 0} Topics</span>
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                            <span>🎯</span>
                            <span>{unit.learning_outcomes?.length || 0} Outcomes</span>
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
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
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                            <span>🧪</span>
                            <span>{unit.practice_activities?.length || 0} Activities</span>
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-background hover:bg-bg-secondary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                            <span>📝</span>
                            <span>{unit.assessments?.length || 0} Assessments</span>
                          </span>
                        </div>
                      )}

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="mt-5 pt-5 border-t border-border space-y-6" onClick={e => e.stopPropagation()}>
                              <div className="grid md:grid-cols-2 gap-6">
                                
                                {/* Topics & Outcomes */}
                                <div className="space-y-5">
                                  {/* Topics covered */}
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
                                      <Code size={13} className="text-primary" />
                                      <span>Syllabus Topics Covered</span>
                                    </h4>
                                    <div className="grid gap-1.5">
                                      {unit.topics.map((topic, tIdx) => (
                                        <div key={tIdx} className="flex items-center gap-2.5 p-2 bg-background rounded-xl border border-border/80">
                                          <div className="w-5 h-5 rounded bg-primary/8 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                                            {tIdx + 1}
                                          </div>
                                          <span className="text-[11px] font-semibold text-text-primary">{topic}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Learning Outcomes */}
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
                                      <CheckCircle2 size={13} className="text-emerald-500" />
                                      <span>Unit Learning Outcomes</span>
                                    </h4>
                                    <div className="space-y-1.5">
                                      {unit.learning_outcomes.map((outcome, oIdx) => (
                                        <div key={oIdx} className="flex items-start gap-2.5 p-2.5 bg-background rounded-xl border border-border/80">
                                          <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={8} strokeWidth={3} />
                                          </div>
                                          <span className="text-[11px] font-semibold text-text-primary leading-relaxed">{outcome}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Resources & Activities */}
                                <div className="space-y-5">
                                  {/* Study Materials */}
                                  <div className="space-y-2.5">
                                    <h4 className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
                                      <Wrench size={13} className="text-secondary" />
                                      <span>Recommended Study Materials</span>
                                    </h4>
                                    <div className="space-y-1.5">
                                      {unit.resources?.youtube && (
                                        <div className="flex items-center gap-2.5 p-2 bg-background rounded-xl border border-border/80">
                                          <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                            <Play size={12} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <a 
                                              href={unit.resources.youtube.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="text-[11px] text-primary hover:underline font-bold truncate block"
                                            >
                                              {unit.resources.youtube.name}
                                            </a>
                                          </div>
                                        </div>
                                      )}

                                      {unit.resources?.google && (
                                        <div className="flex items-center gap-2.5 p-2 bg-background rounded-xl border border-border/80">
                                          <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                            <FileText size={12} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <a 
                                              href={unit.resources.google.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="text-[11px] text-primary hover:underline font-bold truncate block"
                                            >
                                              {unit.resources.google.name}
                                            </a>
                                          </div>
                                        </div>
                                      )}

                                      {unit.resources?.research_paper && (
                                        <div className="flex items-center gap-2.5 p-2 bg-background rounded-xl border border-border/80">
                                          <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                            <Award size={12} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <a 
                                              href={unit.resources.research_paper.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="text-[11px] text-primary hover:underline font-bold truncate block"
                                            >
                                              {unit.resources.research_paper.name}
                                            </a>
                                          </div>
                                        </div>
                                      )}

                                      {unit.resources?.github && (
                                        <div className="flex items-center gap-2.5 p-2 bg-background rounded-xl border border-border/80">
                                          <div className="w-6 h-6 rounded bg-slate-500/10 flex items-center justify-center text-text-primary dark:text-white shrink-0">
                                            <Code size={12} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <a 
                                              href={unit.resources.github.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="text-[11px] text-primary hover:underline font-bold truncate block"
                                            >
                                              {unit.resources.github.name}
                                            </a>
                                          </div>
                                        </div>
                                      )}

                                      {unit.resources?.book && (
                                        <div className="p-2.5 bg-background rounded-xl border border-border/80 text-[10px] font-medium text-text-secondary leading-normal">
                                          <span className="font-bold text-text-primary">Required Textbook: </span>
                                          {unit.resources.book}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Activities & Assessments */}
                                  <div className="p-3.5 bg-background rounded-xl border border-border/80 space-y-3.5">
                                    {unit.practice_activities && (
                                      <div className="space-y-1">
                                        <h5 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Practice Activities</h5>
                                        <ul className="space-y-1 pl-3.5 list-disc text-[11px] text-text-secondary font-medium">
                                          {unit.practice_activities.map((act, idx) => (
                                            <li key={idx}>{act}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {unit.assessments && (
                                      <div className="space-y-1 pt-2 border-t border-border/60">
                                        <h5 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Unit Assessments</h5>
                                        <ul className="space-y-1 pl-3.5 list-disc text-[11px] text-text-secondary font-medium">
                                          {unit.assessments.map((ass, idx) => (
                                            <li key={idx}>{ass}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Navigation between semesters */}
        <div className="flex justify-between mt-12 pt-6 border-t border-border/40">
          {semIndex > 0 ? (
            <button
              onClick={() => navigate(`/curriculum/semester/${semIndex - 1}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold text-text-primary hover:border-primary/45 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Semester {semIndex}
            </button>
          ) : <div />}
          
          {semIndex < curriculum.semesters.length - 1 && (
            <button
              onClick={() => navigate(`/curriculum/semester/${semIndex + 1}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all cursor-pointer btn-premium ml-auto"
            >
              Semester {semIndex + 2}
              <ChevronRight size={14} />
            </button>
          )}
        </div>

      </div>
    </PageTransition>
  )
}
