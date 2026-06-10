import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Wrench, FileText, Code, Check, Play, Award } from 'lucide-react'
import useStore from '../store'
import PageTransition from '../components/PageTransition'

export default function UnitDetail() {
  const { semId, unitId } = useParams()
  const { currentRole, facultyCurriculumData, studentCurriculumData } = useStore()
  const curriculum = currentRole === 'faculty' ? facultyCurriculumData : studentCurriculumData

  if (!curriculum) return null

  const semIndex = parseInt(semId) - 1
  const unitIndex = parseInt(unitId) - 1

  const semester = curriculum.semesters[semIndex]
  if (!semester) return null

  const unit = semester.units[unitIndex]
  if (!unit) return null

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl mx-auto bg-transparent relative z-10 text-text text-left">

        {/* Unit Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border shadow-xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Subtle gradient light overlay */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[10px] font-bold text-primary bg-primary/8 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Semester {semester.semester_number}
                </span>
                <span className="text-[10px] font-bold text-primary bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Bloom: {unit.blooms_taxonomy}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-text-primary mb-2">{unit.name}</h1>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">{unit.description}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-primary/10 shrink-0">
              <BookOpen size={20} />
            </div>
          </div>
        </motion.div>

        {/* Detail Tabs Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Topics Covered & Learning Outcomes */}
          <div className="space-y-6">
            
            {/* Topics covered */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Code size={15} className="text-primary" />
                <span>Syllabus Topics Covered</span>
              </h3>
              <div className="grid gap-2">
                {unit.topics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/8 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-text-primary">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-500" />
                <span>Unit Learning Outcomes (LOs)</span>
              </h3>
              <div className="space-y-3">
                {unit.learning_outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 bg-background rounded-xl border border-border">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className="text-xs font-semibold text-text-primary leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Academic Resource Recommendations & Activities */}
          <div className="space-y-6">
            
            {/* Academic Recommendations */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Wrench size={15} className="text-primary" />
                <span>Recommended Study Materials</span>
              </h3>
              <div className="space-y-3.5">
                
                {/* YouTube */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <Play size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">YouTube Core Lecture</h4>
                    <a 
                      href={unit.resources.youtube.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-primary hover:underline font-semibold mt-0.5 inline-block"
                    >
                      {unit.resources.youtube.name}
                    </a>
                  </div>
                </div>

                {/* Google Docs */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <FileText size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Official Documentation Guides</h4>
                    <a 
                      href={unit.resources.google.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-primary hover:underline font-semibold mt-0.5 inline-block"
                    >
                      {unit.resources.google.name}
                    </a>
                  </div>
                </div>

                {/* Research Paper */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Award size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Accredited Research Paper</h4>
                    <a 
                      href={unit.resources.research_paper.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-primary hover:underline font-semibold mt-0.5 inline-block"
                    >
                      {unit.resources.research_paper.name}
                    </a>
                  </div>
                </div>

                {/* GitHub repository */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-text-primary/10 flex items-center justify-center text-text-primary shrink-0">
                    <Code size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">GitHub Code Repository</h4>
                    <a 
                      href={unit.resources.github.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-primary hover:underline font-semibold mt-0.5 inline-block"
                    >
                      {unit.resources.github.name}
                    </a>
                  </div>
                </div>

                {/* Book */}
                <div className="p-3 bg-background rounded-xl border border-border text-[11px] font-semibold text-text-secondary leading-normal">
                  <span className="font-bold text-text-primary">Required Textbook: </span>
                  {unit.resources.book}
                </div>

              </div>
            </div>

            {/* Practice & Assessment Activities */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <FileText size={15} className="text-primary" />
                <span>Activities & Assessments</span>
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Practice Activities</h4>
                  <ul className="space-y-1.5 pl-3 list-disc text-xs text-text-secondary font-medium">
                    {unit.practice_activities.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Assessment Strategy</h4>
                  <ul className="space-y-1.5 pl-3 list-disc text-xs text-text-secondary font-medium">
                    {unit.assessments.map((ass, idx) => (
                      <li key={idx}>{ass}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </PageTransition>
  )
}
