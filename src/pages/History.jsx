import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, ChevronRight } from 'lucide-react'
import useStore from '../store'
import PageTransition from '../components/PageTransition'

const LEVELS = ['All', 'Bachelor', 'Master', 'Diploma', 'Certificate']
const PER_PAGE = 5

export default function History() {
  const navigate = useNavigate()
  const {
    currentRole,
    facultyHistoryData,
    studentHistoryData,
    setFacultyCurriculumData,
    setStudentCurriculumData,
    loadFacultyHistoryData,
    loadStudentHistoryData,
    deleteFacultyHistoryData,
    deleteStudentHistoryData
  } = useStore()

  const history = currentRole === 'faculty' ? facultyHistoryData : studentHistoryData
  const setCurriculum = currentRole === 'faculty' ? setFacultyCurriculumData : setStudentCurriculumData

  const onDelete = (id) => {
    if (currentRole === 'faculty') {
      deleteFacultyHistoryData(id)
    } else {
      deleteStudentHistoryData(id)
    }
  }

  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (currentRole === 'faculty') {
      if (loadFacultyHistoryData) loadFacultyHistoryData()
    } else {
      if (loadStudentHistoryData) loadStudentHistoryData()
    }
  }, [currentRole, loadFacultyHistoryData, loadStudentHistoryData])

  const filtered = history.filter(h => {
    const matchSearch = h.program_name.toLowerCase().includes(search.toLowerCase()) ||
      h.skill?.toLowerCase().includes(search.toLowerCase()) ||
      h.industry_focus.toLowerCase().includes(search.toLowerCase())
    const matchLevel = level === 'All' || h.education_level === level
    return matchSearch && matchLevel
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <PageTransition>
      <div className="p-8 max-w-5xl mx-auto space-y-8 bg-transparent relative z-10 text-text">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">History Log</h1>
          <p className="text-text-secondary text-sm">Browse, filter, and review previously generated academic curricula.</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          {/* Search Input */}
          <div className="relative flex-1 text-left">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search programs, skills, industry focus..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
            />
          </div>
          
          {/* Filter badges */}
          <div className="flex gap-2 flex-wrap items-center justify-start">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => { setLevel(l); setPage(1) }}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                  level === l
                    ? 'gradient-bg text-white border-transparent shadow-lg shadow-primary/20'
                    : 'bg-card text-text-secondary border-border hover:border-primary/40'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-4 text-left">
          {paged.length === 0 ? (
            <div className="text-center py-20 text-text-secondary bg-card rounded-3xl border border-border p-8 space-y-4 flex flex-col items-center justify-center">
              <BookOpen size={32} className="text-primary animate-pulse" />
              <div>
                <p className="text-sm font-bold text-text-primary">No Curricula Found</p>
                <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">You haven't generated any curricula yet or none match your current search.</p>
              </div>
              <button
                onClick={() => navigate('/generate')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer btn-premium"
              >
                <span>Generate Curriculum</span>
                <ChevronRight size={12} />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-card border border-border rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-secondary/50">
                    <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Curriculum Name</th>
                    <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date Generated</th>
                    <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Domain</th>
                    <th className="p-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((item) => (
                    <tr key={item.id} className="hover:bg-bg-secondary/50 transition-colors">
                      <td className="p-4 text-xs font-bold text-text-primary">{item.program_name}</td>
                      <td className="p-4 text-xs font-medium text-text-secondary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-xs font-semibold text-text-secondary">{item.skill || item.domain || 'N/A'}</td>
                      <td className="p-4 text-xs text-right space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            setCurriculum(item.semesters ? item : null)
                            navigate('/curriculum')
                          }}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(item.id)
                          }}
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
        </div>


        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 select-none">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary disabled:opacity-40 hover:border-primary/45 transition-colors cursor-pointer bg-card"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  page === i + 1 
                    ? 'gradient-bg text-white shadow-lg shadow-primary/20' 
                    : 'border border-border text-text-secondary bg-card hover:border-primary/45'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary disabled:opacity-40 hover:border-primary/45 transition-colors cursor-pointer bg-card"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </PageTransition>
  )
}
