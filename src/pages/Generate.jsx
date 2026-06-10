import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Check, ChevronRight } from 'lucide-react'
import useStore from '../store'
import PageTransition from '../components/PageTransition'

export default function Generate() {
  const navigate = useNavigate()
  const { currentRole, setFacultyCurriculumData, setStudentCurriculumData } = useStore()

  useEffect(() => {
    if (currentRole === 'faculty') {
      setFacultyCurriculumData(null)
    } else {
      setStudentCurriculumData(null)
    }
  }, [currentRole, setFacultyCurriculumData, setStudentCurriculumData])

  const roles = [
    {
      title: 'Faculty Workspace',
      subtitle: 'For Educators & Directors',
      description: 'Create complete academic curricula, generate unit-wise syllabus outlines, configure quizzes directly, and export PDF handbooks.',
      features: [
        'Curriculum Generation with AI Outliner',
        'Bloom\'s Taxonomy Outcome Mapping',
        'Unit-specific Quiz Generator (any count)',
        'Reference Recommendations (Docs, YouTube, Papers)',
        'Accreditation Exports (PDF Handbook)'
      ],
      path: '/faculty',
      icon: GraduationCap,
      color: 'from-primary/20 via-primary/5 to-transparent',
      borderColor: 'group-hover:border-primary/50',
      badge: 'Academic Lead',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      btnText: 'Enter Faculty Workspace'
    },
    {
      title: 'Student Workspace',
      subtitle: 'For Students & Learners',
      description: 'Generate custom study paths, take self-practice quizzes, plan your schedules, and earn achievements as you progress.',
      features: [
        'Interactive Study Blueprints & Modules',
        'Self-Practice Quizzes with AI Feedback',
        '30/60/90 Day Study Planner',
        'Skill Achievements & Cognitive Badges',
        'Targeted Resource Links (Docs, Books, Videos)'
      ],
      path: '/student',
      icon: BookOpen,
      color: 'from-secondary/20 via-secondary/5 to-transparent',
      borderColor: 'group-hover:border-secondary/50',
      badge: 'Active Learner',
      badgeColor: 'bg-secondary/10 text-secondary border-secondary/20',
      btnText: 'Enter Student Workspace'
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 md:p-8 max-w-6xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mb-8 space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-text-primary leading-tight tracking-tight"
          >
            Choose Your <span className="gradient-text">Learning Role</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm md:text-base text-text-secondary"
          >
            Select how you would like to use the platform. Access tools tailored for teaching coordinators or personalized self-study.
          </motion.p>
        </div>

        {/* Roles Selection Grid */}
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {roles.map((role, idx) => {
            const Icon = role.icon
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 * (idx + 1) }}
                onClick={() => navigate(role.path)}
                className={`group cursor-pointer text-left bg-card border border-border/80 rounded-3xl p-8 relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between h-full`}
              >
                {/* Visual Gradient Background Mesh */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`} />

                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <Icon size={22} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${role.badgeColor}`}>
                      {role.badge}
                    </span>
                  </div>

                  {/* Title & Sub */}
                  <div className="relative z-10 mb-4">
                    <h2 className="text-xl md:text-2xl font-black text-text-primary group-hover:text-primary transition-colors">
                      {role.title}
                    </h2>
                    <p className="text-xs font-bold text-text-secondary mt-1">
                      {role.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-6 relative z-10">
                    {role.description}
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-border/60 my-5 relative z-10" />

                  {/* Features checklist */}
                  <div className="space-y-3 relative z-10 mb-8">
                    {role.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5 text-xs text-text-secondary font-medium">
                        <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entry CTA Button */}
                <div className="relative z-10 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(role.path)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white font-bold transition-all text-xs border border-primary/10 group-hover:shadow-lg group-hover:shadow-primary/25 cursor-pointer btn-premium"
                  >
                    <span>{role.btnText}</span>
                    <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

              </motion.div>
            )
          })}
        </div>

      </div>
    </PageTransition>
  )
}
