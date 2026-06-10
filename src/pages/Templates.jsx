import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BookOpen } from 'lucide-react'
import useStore from '../store'
import { generateCurriculum } from '../lib/utils'
import PageTransition from '../components/PageTransition'

const templates = [
  {
    title: 'B.Sc Machine Learning',
    badge: 'Popular',
    badgeColor: 'bg-primary/8 dark:bg-primary/15 text-primary',
    desc: 'Full 6-semester undergraduate program covering fundamentals to deep learning deployment.',
    form: { skill: 'Machine Learning', level: 'Bachelor', semesters: '6', weeklyHours: '20', industryFocus: 'Technology', curriculumType: 'Theory + Practical' },
    tags: ['Neural Networks', 'MLOps', 'NLP', 'Computer Vision'],
    icon: '🤖',
  },
  {
    title: 'M.Sc Data Science',
    badge: 'Research',
    badgeColor: 'bg-violet-100 dark:bg-violet-950/30 text-violet-650 dark:text-violet-400',
    desc: 'Graduate-level 4-semester program focused on big data, analytics, and AI research.',
    form: { skill: 'Data Science', level: 'Master', semesters: '4', weeklyHours: '25', industryFocus: 'Healthcare', curriculumType: 'Research-Focused' },
    tags: ['Big Data', 'Spark', 'Causal Inference', 'Forecasting'],
    icon: '📊',
  },
  {
    title: 'Full-Stack Bootcamp',
    badge: 'Fast Track',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-405',
    desc: 'Intensive 2-semester bootcamp for professional web developers.',
    form: { skill: 'Web Development', level: 'Bootcamp', semesters: '2', weeklyHours: '40', industryFocus: 'E-Commerce', curriculumType: 'Project-Based' },
    tags: ['React', 'Node.js', 'Databases', 'DevOps'],
    icon: '🌐',
  },
  {
    title: 'Cloud Computing Cert',
    badge: 'Industry',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/30 text-amber-650 dark:text-amber-405',
    desc: '3-semester professional certification program aligned with AWS/GCP standards.',
    form: { skill: 'Cloud Computing', level: 'Certificate', semesters: '3', weeklyHours: '15', industryFocus: 'Technology', curriculumType: 'Industry-Integrated' },
    tags: ['AWS', 'Kubernetes', 'Serverless', 'IaC'],
    icon: '☁️',
  },
  {
    title: 'Cybersecurity Professional',
    badge: 'Security',
    badgeColor: 'bg-red-100 dark:bg-red-950/30 text-red-650 dark:text-red-405',
    desc: '4-semester professional program covering ethical hacking, forensics, and compliance.',
    form: { skill: 'Cybersecurity', level: 'Professional', semesters: '4', weeklyHours: '20', industryFocus: 'Government', curriculumType: 'Theory + Practical' },
    tags: ['Ethical Hacking', 'SIEM', 'Forensics', 'Zero Trust'],
    icon: '🔐',
  },
  {
    title: 'Mobile Dev Diploma',
    badge: 'New',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/30 text-cyan-650 dark:text-cyan-405',
    desc: '3-semester diploma focusing on iOS, Android, and cross-platform mobile development.',
    form: { skill: 'Mobile Development', level: 'Diploma', semesters: '3', weeklyHours: '20', industryFocus: 'E-Commerce', curriculumType: 'Project-Based' },
    tags: ['React Native', 'Flutter', 'App Store', 'CI/CD'],
    icon: '📱',
  },
]

export default function Templates() {
  const navigate = useNavigate()
  const { setCurriculum, addToHistory } = useStore()

  const handleUseTemplate = async (form) => {
    const result = generateCurriculum(form)
    setCurriculum(result)
    addToHistory(result)
    navigate('/curriculum')
  }

  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto space-y-8 bg-transparent relative z-10 text-text-primary">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">Degree Templates</h1>
          <p className="text-text-secondary text-sm">Kickstart your planning with a customizable structural template.</p>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(({ title, badge, badgeColor, desc, form, tags, icon }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-3xl border border-border shadow-sm p-6 hover-lift flex flex-col justify-between group"
            >
              <div className="text-left">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl select-none">{icon}</span>
                  <span className={`px-3 py-1 text-[10px] font-extrabold rounded-lg ${badgeColor}`}>{badge}</span>
                </div>
                
                <h3 className="font-extrabold text-text-primary text-sm mb-2">{title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">{desc}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {tags.map(t => (
                    <span key={t} className="px-2 py-0.5 text-[9px] font-bold bg-background border border-border rounded-md text-text-secondary">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleUseTemplate(form)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white gradient-bg rounded-xl shadow shadow-primary/10 hover:opacity-95 transition-opacity cursor-pointer btn-premium"
                >
                  <Sparkles size={12} />
                  <span>Use Template</span>
                </button>
                <button
                  onClick={() => navigate('/generate')}
                  className="px-3 py-2.5 bg-card border border-border rounded-xl text-text-secondary hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <BookOpen size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </PageTransition>
  )
}
