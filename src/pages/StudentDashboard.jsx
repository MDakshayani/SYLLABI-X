import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, BookOpen, ChevronDown, CheckCircle2, Terminal, Layers, 
  Calendar, Clock, Award, Play, AlertCircle, 
  Compass, Trophy, ArrowRight, ChevronRight,
  LayoutDashboard, Download, FileText, Lock
} from 'lucide-react'
import useStore from '../store'
import useAuthStore from '../store/authStore'
import { generateCurriculum, generateCurriculumQuiz } from '../lib/utils'
import { generateQuizFromGroq, evaluateAnswersWithGroq } from '../lib/quizGroqService'
import {
  downloadStudentBlueprintPDF,
  downloadStudentPlannerPDF,
  downloadQuizQuestionPaperPDF,
  downloadQuizAnswerKeyPDF,
  downloadQuizResultReportPDF
} from '../lib/pdfGenerator'
import PageTransition from '../components/PageTransition'
import DocMentor from '../components/DocMentor'
import ErrorBoundary from '../components/ErrorBoundary'
import PDFExportModal from '../components/PDFExportModal'

const selectCls = "w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium"

// Badges list definition
const badgesList = [
  { id: 'explorer', name: 'Curriculum Explorer', desc: 'Created your first customized study blueprint.', icon: Compass },
  { id: 'firstQuiz', name: 'First Quiz Completed', desc: 'Completed a practice quiz of any score.', icon: CheckCircle2 },
  { id: 'highscore', name: 'Scored Above 80%', desc: 'Scored 80% or higher on a topic quiz.', icon: Award },
  { id: 'planner', name: 'Time Architect', desc: 'Scheduled a custom study planner path.', icon: Calendar },
  { id: 'streak', name: 'Consistent Learner', desc: 'Maintained an active study streak > 0.', icon: Trophy }
]

const getPerformanceDetails = (pct) => {
  if (pct >= 95) {
    return {
      level: 'Outstanding Performer',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badgeColor: 'bg-emerald-500',
      celebration: '🎉 Outstanding Work!',
      subText: 'You mastered this topic.'
    }
  } else if (pct >= 80) {
    return {
      level: 'Excellent Work',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      badgeColor: 'bg-indigo-500',
      celebration: '🚀 Great Progress!',
      subText: 'Keep learning and improving.'
    }
  } else if (pct >= 70) {
    return {
      level: 'Good Progress',
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      badgeColor: 'bg-cyan-500',
      celebration: '🚀 Great Progress!',
      subText: 'Keep learning and improving.'
    }
  } else if (pct >= 50) {
    return {
      level: 'Needs Improvement',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badgeColor: 'bg-amber-500',
      celebration: '📚 Nice Effort!',
      subText: 'Review a few concepts and try again.'
    }
  } else {
    return {
      level: 'Practice Recommended',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badgeColor: 'bg-rose-500',
      celebration: "💡 Don't Give Up!",
      subText: 'Every expert started as a beginner.'
    }
  }
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const {
    setCurrentRole,
    studentCurriculumData: curriculum,
    setStudentCurriculumData: setCurriculum,
    studentHistoryData: history,
    addStudentHistoryData: addToHistory,
    loadStudentHistoryData: loadHistory,
    deleteStudentHistoryData: deleteFromHistory,
    studentQuizData: quizQuestions,
    setStudentQuizData: setQuizQuestions,
    studentScoresData: quizResult,
    setStudentScoresData: setQuizResult
  } = useStore()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [form, setForm] = useState({
    skill: '',
    customSkill: '',
    level: '',
    semesters: '',
    customSemesters: '',
    weeklyHours: '',
    industryFocus: '',
    customIndustry: '',
    curriculumType: '',
  })

  const [loading, setLoading] = useState(false)
  const [loadStep, setLoadStep] = useState(0)

  // Quiz state
  const [quizForm, setQuizForm] = useState({
    count: '5',
    customCount: '',
    difficulty: 'Medium',
    types: ['MCQ', 'True/False', 'Short Answer', 'Scenario Based', 'Application Based', 'Descriptive', 'Fill in the Blanks'],
    quizMode: 'Practice Quiz',
    examStyle: false
  })
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizEvaluating, setQuizEvaluating] = useState(false)
  const [blueprintPdfDownloading, setBlueprintPdfDownloading] = useState(false)
  const [plannerPdfDownloading, setPlannerPdfDownloading] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [pendingPDF, setPendingPDF] = useState(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [exportModalTitle, setExportModalTitle] = useState('Study Blueprint Export')
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [showBadgePopup, setShowBadgePopup] = useState(null)
  
  // Confetti state
  const [particles, setParticles] = useState([])

  // Planner state
  const [plannerDays, setPlannerDays] = useState('30')
  const [customPlannerDays, setCustomPlannerDays] = useState('')
  const [generatedPlan, setGeneratedPlan] = useState(null)

  // Isolated student stats in localStorage
  const uId = user?.id || user?.email || 'guest'
  const statsKey = `student_stats_${uId}`

  const getTodayDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [stats, setStats] = useState(() => {
    const todayStr = getTodayDateString()
    try {
      const stored = localStorage.getItem(statsKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        let streakVal = parsed.streak ?? 0
        const lastAct = parsed.lastActivityDate || null
        if (lastAct) {
          const lastDate = new Date(lastAct)
          const todayDate = new Date(todayStr)
          const diffTime = todayDate.getTime() - lastDate.getTime()
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
          if (diffDays > 1) {
            streakVal = 0 // Reset if skipped a day
          }
        }
        return {
          streak: streakVal,
          lastActivityDate: lastAct,
          completedQuizzes: parsed.completedQuizzes ?? 0,
          totalScore: parsed.totalScore ?? 0,
          totalQuestions: parsed.totalQuestions ?? 0,
          averageScore: parsed.averageScore ?? 0,
          topicsCompleted: parsed.topicsCompleted ?? 0,
          progressPercentage: parsed.progressPercentage ?? 0,
          unlockedBadges: parsed.unlockedBadges ?? {}
        }
      }
    } catch (err) {
      console.warn("Could not parse student stats from localStorage:", err)
    }
    return {
      streak: 0,
      lastActivityDate: null,
      completedQuizzes: 0,
      totalScore: 0,
      totalQuestions: 0,
      averageScore: 0,
      topicsCompleted: 0,
      progressPercentage: 0,
      unlockedBadges: {}
    }
  })

  useEffect(() => {
    setCurrentRole('student')
    if (loadHistory) loadHistory()
    // Always start a fresh generation session on portal mount unless navigating via history load
    setCurriculum(null)
    
    // Save updated stats on mount in case streak was reset
    localStorage.setItem(statsKey, JSON.stringify(stats))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateStats = (updater) => {
    setStats(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      try {
        localStorage.setItem(statsKey, JSON.stringify(next))
      } catch (err) {
        console.warn("Could not update student stats in localStorage:", err)
      }
      return next
    })
  }

  const unlockBadge = (badgeId) => {
    if (stats.unlockedBadges[badgeId]) return
    const updatedBadges = { ...stats.unlockedBadges, [badgeId]: true }
    updateStats({ unlockedBadges: updatedBadges })
    const badgeObj = badgesList.find(b => b.id === badgeId)
    if (badgeObj) {
      setShowBadgePopup(badgeObj)
    }
  }

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
    const finalSemesters = form.semesters === 'Custom Duration' ? (form.customSemesters || '4') : form.semesters

    const result = generateCurriculum({
      ...form,
      skill: finalSkill,
      industryFocus: finalIndustry,
      semesters: finalSemesters
    })
    
    setCurriculum(result)
    addToHistory(result)
    setLoading(false)

    // Calculate new streak
    const todayStr = getTodayDateString()
    updateStats(prev => {
      let nextStreak = prev.streak
      const lastAct = prev.lastActivityDate
      if (!lastAct) {
        nextStreak = 1
      } else {
        const lastDate = new Date(lastAct)
        const todayDate = new Date(todayStr)
        const diffTime = todayDate.getTime() - lastDate.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          nextStreak = prev.streak + 1
        } else if (diffDays > 1) {
          nextStreak = 1
        } else if (diffDays === 0) {
          nextStreak = prev.streak || 1
        }
      }
      
      const unlocked = { ...prev.unlockedBadges, explorer: true }
      if (nextStreak > 0) unlocked.streak = true
      
      return {
        ...prev,
        streak: nextStreak,
        lastActivityDate: todayStr,
        unlockedBadges: unlocked,
        progressPercentage: Math.min(Math.round((prev.completedQuizzes / 5) * 100), 100),
        topicsCompleted: Math.min(prev.completedQuizzes * 4 + 2, result.stats.totalTopics)
      }
    })

    setTimeout(() => {
      if (!stats.unlockedBadges.explorer) {
        setShowBadgePopup(badgesList.find(b => b.id === 'explorer'))
      }
    }, 500)
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
      console.error("Groq API quiz generation failed, falling back to local generator:", err)
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
      setQuizAnswers({})
      setQuizSubmitted(false)
      setQuizResult(null)
    }
  }

  const handleDownloadBlueprintPDF = async () => {
    if (!curriculum) return
    setBlueprintPdfDownloading(true)
    try {
      const studentName = user?.name || 'Active Learner'
      const generated = await downloadStudentBlueprintPDF(curriculum, studentName)
      setPendingPDF(generated)
      setExportModalTitle('Study Blueprint Export')
      setIsExportOpen(true)
    } catch (err) {
      console.error('Study Blueprint PDF generation error:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setBlueprintPdfDownloading(false)
    }
  }

  const handleDownloadPlannerPDF = async () => {
    if (!generatedPlan || !curriculum) return
    setPlannerPdfDownloading(true)
    try {
      const studentName = user?.name || 'Active Learner'
      const generated = await downloadStudentPlannerPDF(generatedPlan, curriculum.program_name, studentName)
      setPendingPDF(generated)
      setExportModalTitle('Study Planner Export')
      setIsExportOpen(true)
    } catch (err) {
      console.error('Planner PDF generation error:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setPlannerPdfDownloading(false)
    }
  }

  const handleDownloadQuizQuestionPaper = () => {
    if (!quizQuestions || !curriculum) return
    downloadQuizQuestionPaperPDF(curriculum.program_name, quizForm.difficulty, quizForm.quizMode, quizQuestions)
  }

  const handleDownloadQuizAnswerKey = () => {
    if (!quizQuestions || !curriculum) return
    downloadQuizAnswerKeyPDF(curriculum.program_name, quizForm.difficulty, quizForm.quizMode, quizQuestions)
  }

  const handleDownloadQuizResultReport = () => {
    if (!quizResult || !curriculum) return
    const studentName = user?.name || 'Active Learner'
    downloadQuizResultReportPDF(studentName, curriculum.program_name, quizResult)
  }

  const handleSelectOption = (qId, optionIdx) => {
    setQuizAnswers(a => ({ ...a, [qId]: optionIdx }))
  }

  const getCosineSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    const clean = (str) => {
      return str.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    const words1 = clean(str1).split(' ').filter(w => w.length > 2)
    const words2 = clean(str2).split(' ').filter(w => w.length > 2)

    if (words1.length === 0 || words2.length === 0) return 0

    const freq1 = {}
    const freq2 = {}
    const allWords = new Set([...words1, ...words2])

    words1.forEach(w => freq1[w] = (freq1[w] || 0) + 1)
    words2.forEach(w => freq2[w] = (freq2[w] || 0) + 1)

    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0

    allWords.forEach(w => {
      const v1 = freq1[w] || 0
      const v2 = freq2[w] || 0
      dotProduct += v1 * v2
      mag1 += v1 * v1
      mag2 += v2 * v2
    })

    if (mag1 === 0 || mag2 === 0) return 0
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2))
  }

  const evaluateShortAnswer = (studentAns, expectedKeywords, expectedConcept) => {
    if (!studentAns || typeof studentAns !== 'string' || studentAns.trim().length === 0) {
      return { score: 0, isCorrect: false, details: { similarity: 0, feedback: 'No answer submitted.' } }
    }
    const ansLower = studentAns.toLowerCase().trim()
    
    let matchCount = 0
    expectedKeywords.forEach(kw => {
      if (ansLower.includes(kw.toLowerCase().trim())) {
        matchCount++
      }
    })

    const keywordRatio = expectedKeywords.length > 0 ? (matchCount / expectedKeywords.length) : 0
    const cosineSim = getCosineSimilarity(studentAns, expectedConcept)

    // Consider correct if similarity is >= 0.4 or keyword ratio is >= 0.4
    const isCorrect = cosineSim >= 0.4 || keywordRatio >= 0.4;

    return {
      score: isCorrect ? 1.0 : 0.0,
      isCorrect,
      details: {
        similarity: Math.round(Math.max(cosineSim, keywordRatio) * 100),
        matchedKeywords: matchCount,
        totalKeywords: expectedKeywords.length
      }
    }
  }

  const evaluateDescriptive = (studentAns, expectedKeywords, expectedConcept) => {
    if (!studentAns || typeof studentAns !== 'string' || studentAns.trim().length === 0) {
      return { score: 0, feedback: 'No answer submitted.', missing: expectedKeywords.slice(0, 3) }
    }
    
    const cosineSim = getCosineSimilarity(studentAns, expectedConcept)
    const ansLower = studentAns.toLowerCase()
    
    let matchCount = 0
    const missing = []
    expectedKeywords.forEach(kw => {
      if (ansLower.includes(kw.toLowerCase())) {
        matchCount++
      } else {
        missing.push(kw)
      }
    })

    const keywordRatio = expectedKeywords.length > 0 ? (matchCount / expectedKeywords.length) : 0
    const wordCount = studentAns.split(/\s+/).filter(w => w.length > 2).length

    let score = 0
    if (wordCount > 5) {
      score += cosineSim * 4
      score += keywordRatio * 4
      score += Math.min(2, wordCount / 25)
    }
    score = Math.max(0, Math.min(10, Math.round(score)))

    let feedback;
    if (score >= 9) {
      feedback = 'Outstanding comprehensive overview with strong structural design and accurate concepts.'
    } else if (score >= 7) {
      feedback = 'Good understanding of the core topic, but could address trade-offs and scaling parameters more deeply.'
    } else if (score >= 5) {
      feedback = 'Basic explanation provided, but missing several critical architectural details and keywords.'
    } else {
      feedback = 'Review recommended. Make sure to define design patterns, scaling bottlenecks, and correct keywords.'
    }

    return {
      score,
      feedback,
      missing: missing.slice(0, 3)
    }
  }

  const evaluateCodingQuestion = (studentAns) => {
    const code = studentAns?.code || (typeof studentAns === 'string' ? studentAns : '')
    const language = studentAns?.language || 'Python'
    if (!code || code.trim().length === 0) {
      return { correct: false, score: 0, feedback: 'No code submitted.' }
    }
    const lowerCode = code.toLowerCase()
    const hasFunction = lowerCode.includes('def ') || lowerCode.includes('function') || lowerCode.includes('class ') || lowerCode.includes('public static void')
    const hasKeywords = lowerCode.includes('return') || lowerCode.includes('for ') || lowerCode.includes('while') || lowerCode.includes('if ') || lowerCode.includes('const') || lowerCode.includes('let')
    const checkOptimization = lowerCode.includes('optimize') || lowerCode.includes('cache') || lowerCode.includes('pool') || lowerCode.includes('stream') || lowerCode.includes('buffer') || lowerCode.includes('import')
    let matches = 0
    if (hasFunction) matches++
    if (hasKeywords) matches++
    if (checkOptimization) matches++
    if (code.trim().length > 30) matches++
    const isCorrect = matches >= 2
    return {
      correct: isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect 
        ? `Valid ${language} snippet demonstrating proper syntactic structures.`
        : 'Invalid or incomplete code snippet. Outline optimization variables.'
    }
  }

  const handleSubmitQuiz = async (e) => {
    e.preventDefault()
    if (!quizQuestions) return
    setQuizEvaluating(true)

    // Separate open-ended questions for Groq API evaluation
    const openEndedSubmissions = [];
    quizQuestions.forEach(q => {
      if (q.type === 'Short Answer' || q.type === 'Descriptive' || q.type === 'Long Answer' || q.type === 'Scenario Based' || q.type === 'Interview Style' || q.type === 'Case Study') {
        openEndedSubmissions.push({
          id: q.id,
          type: q.type,
          question: q.question,
          expectedKeywords: q.expectedKeywords || [],
          expectedConcept: q.expectedConcept || "",
          studentAns: quizAnswers[q.id] || ""
        });
      }
    });

    let groqEvaluations = {};
    if (openEndedSubmissions.length > 0) {
      try {
        groqEvaluations = await evaluateAnswersWithGroq(openEndedSubmissions);
      } catch (err) {
        console.error("Groq evaluation failed, falling back to local grading:", err);
        // Fallback: evaluate locally
        openEndedSubmissions.forEach(sub => {
          if (sub.type === 'Short Answer') {
            const evalRes = evaluateShortAnswer(sub.studentAns, sub.expectedKeywords, sub.expectedConcept);
            groqEvaluations[sub.id] = {
              score: evalRes.isCorrect ? 1.0 : 0.0,
              isCorrect: evalRes.isCorrect,
              feedback: "Evaluation completed offline.",
              missing: sub.expectedKeywords.slice(0, 2),
              similarity: evalRes.details.similarity
            };
          } else {
            // Descriptive, Long Answer, Scenario Based, Case Study, Interview Style
            const evalRes = evaluateDescriptive(sub.studentAns, sub.expectedKeywords, sub.expectedConcept);
            groqEvaluations[sub.id] = {
              score: evalRes.score,
              isCorrect: evalRes.score >= 5,
              feedback: evalRes.feedback,
              missing: evalRes.missing,
              similarity: 0
            };
          }
        });
      }
    }

    let correctCount = 0
    const questionsReview = []

    quizQuestions.forEach(q => {
      const studentAns = quizAnswers[q.id]
      let isCorrect;
      let details = null;
      let mark;

      if (q.type === 'Short Answer' || q.type === 'Descriptive' || q.type === 'Long Answer' || q.type === 'Scenario Based' || q.type === 'Interview Style' || q.type === 'Case Study') {
        const evaluation = groqEvaluations[q.id] || {
          score: 0,
          isCorrect: false,
          feedback: "Evaluation failed.",
          missing: [],
          similarity: 0
        };
        isCorrect = evaluation.isCorrect;
        mark = isCorrect ? 1 : 0;
        
        if (q.type === 'Short Answer') {
          details = {
            similarity: evaluation.similarity || (evaluation.isCorrect ? 100 : 0),
            matchedKeywords: q.expectedKeywords ? q.expectedKeywords.filter(k => (studentAns || "").toLowerCase().includes(k.toLowerCase())).length : 0,
            totalKeywords: q.expectedKeywords ? q.expectedKeywords.length : 0
          };
        } else {
          details = {
            score: evaluation.score,
            feedback: evaluation.feedback,
            missing: evaluation.missing || []
          };
        }
      } else if (q.type === 'Fill in the Blanks') {
        const expected = (q.expectedConcept || "").toLowerCase().trim()
        const actual = (studentAns || "").toLowerCase().trim()
        isCorrect = actual.includes(expected) || expected.includes(actual)
        mark = isCorrect ? 1 : 0
        details = { similarity: isCorrect ? 100 : 0 }
      } else if (q.type === 'Application Based') {
        const evaluation = evaluateCodingQuestion(studentAns)
        isCorrect = evaluation.correct
        mark = isCorrect ? 1 : 0
        details = evaluation
      } else {
        // MCQ / True-False
        isCorrect = studentAns === q.correct
        mark = isCorrect ? 1 : 0
      }

      if (isCorrect) {
        correctCount++
      }

      questionsReview.push({
        ...q,
        studentAns,
        isCorrect,
        details,
        mark
      })
    })

    setQuizEvaluating(false)

    const scorePct = Math.round((correctCount / quizQuestions.length) * 100)
    
    // AI Feedback generator logic matching personalized feedback thresholds
    let feedback;
    if (scorePct >= 90) {
      feedback = "Outstanding Performance! Exceptionally high comprehension demonstrated."
    } else if (scorePct >= 80) {
      feedback = "Excellent Work! Excellent scores and topic understanding."
    } else if (scorePct >= 70) {
      feedback = "Good Progress! Satisfactory results. Keep learning and improving."
    } else if (scorePct >= 50) {
      feedback = "Needs Improvement! Review a few concepts and practice again."
    } else {
      feedback = "Review Recommended! Master foundation concepts before re-attempting."
    }

    const strengthAreas = []
    const weakAreas = []
    const recommendedTopics = []

    // Group answers by topic to determine strengths & weaknesses
    const topicResults = {}
    questionsReview.forEach(q => {
      const topicName = q.topic || 'General Concepts'
      if (!topicResults[topicName]) {
        topicResults[topicName] = { correct: 0, total: 0, improvements: q.improvements }
      }
      topicResults[topicName].total++
      if (q.isCorrect) {
        topicResults[topicName].correct++
      }
    })

    Object.keys(topicResults).forEach(topicName => {
      const res = topicResults[topicName]
      const pct = (res.correct / res.total) * 100
      if (pct >= 80) {
        strengthAreas.push(topicName)
      } else {
        weakAreas.push(topicName)
        recommendedTopics.push({
          topic: topicName,
          reason: `Scored ${Math.round(pct)}% on related questions.`,
          suggestion: res.improvements || 'Review key definitions, trade-offs and practice implementation parameters.'
        })
      }
    })

    // If strengthAreas is empty, fill with high scorers or fallback
    if (strengthAreas.length === 0 && correctCount > 0) {
      let bestTopic = null
      let bestPct = -1
      Object.keys(topicResults).forEach(t => {
        const pct = (topicResults[t].correct / topicResults[t].total) * 100
        if (pct > bestPct) {
          bestPct = pct
          bestTopic = t
        }
      })
      if (bestTopic) strengthAreas.push(bestTopic)
    }

    const result = {
      score: correctCount,
      incorrect: quizQuestions.length - correctCount,
      total: quizQuestions.length,
      feedback,
      percentage: scorePct,
      accuracy: scorePct,
      strengthAreas: strengthAreas.length > 0 ? strengthAreas : ['Foundational Concepts'],
      weakAreas: weakAreas.length > 0 ? weakAreas : ['None! Core topics mastered.'],
      recommendedTopics: recommendedTopics.length > 0 ? recommendedTopics : [{ topic: 'All Topics Mastered', reason: 'You have shown high accuracy across all concepts.', suggestion: 'Advance to harder levels or explore additional curriculum paths.' }],
      reviews: questionsReview
    }

    setQuizResult(result)
    setQuizSubmitted(true)

    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of screen width
      y: -10 - Math.random() * 20, // initial top offset
      size: Math.random() * 8 + 6,
      color: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 1.5,
      duration: Math.random() * 3 + 2.5,
      tilt: Math.random() * 360
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 8000)

    // Update stats
    const todayStr = getTodayDateString()
    updateStats(prev => {
      let nextStreak = prev.streak
      const lastAct = prev.lastActivityDate
      if (!lastAct) {
        nextStreak = 1
      } else {
        const lastDate = new Date(lastAct)
        const todayDate = new Date(todayStr)
        const diffTime = todayDate.getTime() - lastDate.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          nextStreak = prev.streak + 1
        } else if (diffDays > 1) {
          nextStreak = 1
        } else if (diffDays === 0) {
          nextStreak = prev.streak || 1
        }
      }

      const nextCompleted = prev.completedQuizzes + 1
      const nextScore = prev.totalScore + correctCount
      const nextQuestions = prev.totalQuestions + quizQuestions.length
      const avg = Math.round((nextScore / nextQuestions) * 100)
      
      const unlocked = { ...prev.unlockedBadges }
      unlocked.firstQuiz = true
      if (scorePct >= 80) unlocked.highscore = true
      if (nextStreak > 0) unlocked.streak = true
      
      const totalT = curriculum ? curriculum.stats.totalTopics : 40
      const topicsC = Math.min(nextCompleted * 4 + 2, totalT)
      const progress = Math.min(Math.round((nextCompleted / 5) * 100), 100)

      return {
        streak: nextStreak,
        lastActivityDate: todayStr,
        completedQuizzes: nextCompleted,
        totalScore: nextScore,
        totalQuestions: nextQuestions,
        averageScore: avg,
        topicsCompleted: topicsC,
        progressPercentage: progress,
        unlockedBadges: unlocked
      }
    })

    // Unlock badge popup if newly unlocked
    setTimeout(() => {
      if (!stats.unlockedBadges.firstQuiz) {
        setShowBadgePopup(badgesList.find(b => b.id === 'firstQuiz'))
      } else if (scorePct >= 80 && !stats.unlockedBadges.highscore) {
        setShowBadgePopup(badgesList.find(b => b.id === 'highscore'))
      }
    }, 1000)
  }

  // Study Planner generator
  const handleGeneratePlanner = (e) => {
    e.preventDefault()
    if (!curriculum) return

    const totalDaysNum = plannerDays === 'Custom' ? parseInt(customPlannerDays) || 30 : parseInt(plannerDays)
    
    if (totalDaysNum < 1 || totalDaysNum > 365) {
      alert("Please enter a duration between 1 and 365 days.")
      return
    }

    const units = curriculum.semesters.flatMap(s => s.units)
    const totalUnits = units.length
    
    // Reserve last 10% of days for Final Review & Capstone Prep (minimum 1 day)
    const finalReviewDays = Math.max(1, Math.floor(totalDaysNum * 0.10))
    const studyDays = totalDaysNum - finalReviewDays
    
    const daysPerUnit = studyDays / totalUnits
    const planDays = []
    
    let currentDay = 1
    units.forEach((unit, uIdx) => {
      const nextTargetDay = Math.round((uIdx + 1) * daysPerUnit)
      const duration = nextTargetDay - Math.round(uIdx * daysPerUnit)
      
      const startDay = currentDay
      const endDay = currentDay + duration - 1
      currentDay = endDay + 1
      
      if (duration <= 1) {
        planDays.push({
          title: `Day ${startDay}`,
          unitName: unit.name,
          type: 'Study & Review',
          description: `Study topics: ${unit.topics.join(', ')}. Practice activities: ${unit.practice_activities?.[0] || 'Review concept logs.'}`,
          icon: '📚'
        })
      } else if (duration === 2) {
        planDays.push({
          title: `Day ${startDay}`,
          unitName: unit.name,
          type: 'Study Focus',
          description: `Study and map topics: ${unit.topics.slice(0, 2).join(', ')}. Check outcomes: ${unit.learning_outcomes?.[0] || ''}`,
          icon: '📚'
        })
        planDays.push({
          title: `Day ${endDay}`,
          unitName: unit.name,
          type: 'Practice & Quiz',
          description: `Execute lab: ${unit.practice_activities?.[0] || 'Build draft sandbox.'}. Take diagnostic unit assessment.`,
          icon: '🧪'
        })
      } else {
        const midStudyEnd = startDay + Math.floor(duration * 0.6) - 1
        planDays.push({
          title: `Day ${startDay}-${midStudyEnd}`,
          unitName: unit.name,
          type: 'Theory Study & Topics',
          description: `Core study of: ${unit.topics.join(', ')}. Target Blooms tier: ${unit.blooms_taxonomy}.`,
          icon: '📚'
        })
        
        const practiceDay = midStudyEnd + 1
        if (practiceDay < endDay) {
          planDays.push({
            title: `Day ${practiceDay}`,
            unitName: unit.name,
            type: 'Practice Lab Day',
            description: `Complete practice task: ${unit.practice_activities?.[0] || 'Execute sandbox lab code.'}`,
            icon: '🧪'
          })
          
          const revisionDay = practiceDay + 1
          if (revisionDay < endDay) {
            planDays.push({
              title: `Day ${revisionDay}`,
              unitName: unit.name,
              type: 'Revision & Summary',
              description: `Summarize Outcomes: ${unit.learning_outcomes?.slice(0, 2).join(' and ')}`,
              icon: '🔄'
            })
            planDays.push({
              title: `Day ${endDay}`,
              unitName: unit.name,
              type: 'Practice Quiz & Test',
              description: `Attempt assessment: ${unit.assessments?.[0] || 'Take diagnostic unit evaluation.'}`,
              icon: '📝'
            })
          } else {
            planDays.push({
              title: `Day ${endDay}`,
              unitName: unit.name,
              type: 'Revision & Quiz',
              description: `Review notes and attempt: ${unit.assessments?.[0] || 'Take diagnostic unit evaluation.'}`,
              icon: '📝'
            })
          }
        } else {
          planDays.push({
            title: `Day ${endDay}`,
            unitName: unit.name,
            type: 'Practice & Evaluation',
            description: `Execute lab activities: ${unit.practice_activities?.[0]} and take quiz.`,
            icon: '🧪'
          })
        }
      }
    })
    
    // Add Final Review Days
    const reviewStart = currentDay
    const reviewEnd = totalDaysNum
    planDays.push({
      title: `Day ${reviewStart}-${reviewEnd}`,
      unitName: 'Curriculum Culmination',
      type: 'Final Review & Capstone Prep',
      description: `Complete Capstone project: "${curriculum.capstone_project?.title}". Prepare deliverables: ${curriculum.capstone_project?.deliverables?.join(', ')}. Conduct final system testing.`,
      icon: '🏆'
    })
    
    setGeneratedPlan({
      totalDays: totalDaysNum,
      milestones: planDays
    })

    unlockBadge('planner')
  }

  // Quiz completion verification checks
  const isAllAnswered = quizQuestions && quizQuestions.every(q => {
    const ans = quizAnswers[q.id]
    if (q.type === 'Short Answer' || q.type === 'Long Answer' || q.type === 'Descriptive' || q.type === 'Fill in the Blanks' || q.type === 'Scenario Based' || q.type === 'Case Study' || q.type === 'Interview Style' || q.type === 'Interview Questions') {
      return ans && typeof ans === 'string' && ans.trim().length > 0
    }
    if (q.type === 'Application Based') {
      const code = ans?.code || ans
      return code && typeof code === 'string' && code.trim().length > 0
    }
    return ans !== undefined
  })

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row relative z-10 text-text-primary bg-transparent">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-sidebar p-6 flex flex-col gap-2 shrink-0 text-left">
          <div className="mb-6 px-2">
            <h2 className="text-sm font-extrabold text-primary uppercase tracking-widest font-sans">Student Hub</h2>
            <p className="text-[10px] text-text-secondary mt-1">Self-study and exam hub</p>
          </div>

          {[
            { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
            { id: 'curriculum', label: 'Study Blueprint', icon: Compass },
            { id: 'resources', label: 'Syllabus Resources', icon: BookOpen },
            { id: 'practice', label: curriculum ? 'Practice Quizzes' : 'Practice Quizzes 🔒', icon: Award },
            { id: 'planner', label: 'Study Planner', icon: Calendar },
            { id: 'tutor', label: 'AI PDF Tutor', icon: FileText },
            { id: 'history', label: 'Saved Roadmaps', icon: Clock },
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

        {/* Main Panel Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab !== 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2 text-left">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-card border border-border hover:border-primary/45 hover:text-primary rounded-xl text-xs font-bold transition-all cursor-pointer mb-4"
              >
                ← Back
              </button>
            </motion.div>
          )}
          <AnimatePresence mode="wait">

            {/* ── STUDENT DASHBOARD PORTAL ── */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-4xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">AI Learning Assistant Dashboard</h1>
                  <p className="text-xs text-text-secondary mt-1">Welcome back, {user?.name || 'Student'}! Keep building your skills and tracking your targets. 🚀</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-left relative overflow-hidden group">
                    <div className="absolute top-[-10px] right-[-10px] text-primary/5 font-black text-7xl select-none group-hover:scale-110 transition-transform">🔥</div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Study Streak</p>
                    <p className="text-2xl font-black text-primary mt-1.5">{stats.streak} Days 🔥</p>
                    <p className="text-[9px] text-text-secondary mt-1">Keep learning daily to grow</p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-left relative overflow-hidden group">
                    <div className="absolute top-[-10px] right-[-10px] text-primary/5 font-black text-7xl select-none group-hover:scale-110 transition-transform">✅</div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Quizzes Taken</p>
                    <p className="text-2xl font-black text-text-primary mt-1.5">{stats.completedQuizzes} Taken ✅</p>
                    <p className="text-[9px] text-text-secondary mt-1">Test your skill mastery</p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-left relative overflow-hidden group">
                    <div className="absolute top-[-10px] right-[-10px] text-primary/5 font-black text-7xl select-none group-hover:scale-110 transition-transform">📈</div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Average Score</p>
                    <p className="text-2xl font-black text-text-primary mt-1.5">{stats.averageScore}% 📈</p>
                    <p className="text-[9px] text-text-secondary mt-1">Maintain high benchmarks</p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-left relative overflow-hidden group">
                    <div className="absolute top-[-10px] right-[-10px] text-primary/5 font-black text-7xl select-none group-hover:scale-110 transition-transform">🎓</div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Topics Mastered</p>
                    <p className="text-2xl font-black text-text-primary mt-1.5">{stats.topicsCompleted} Topics 🎓</p>
                    <p className="text-[9px] text-text-secondary mt-1">Progressing through units</p>
                  </div>
                </div>

                {/* Progress bar card */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/8 border border-primary/15 px-2.5 py-0.5 rounded-full w-fit">
                      Active Learning Curriculum
                    </p>
                    <h3 className="text-lg font-black text-text-primary">
                      {curriculum ? curriculum.program_name : "No Active Blueprint"}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {curriculum 
                        ? `Focusing on ${curriculum.industry_focus} application at a ${curriculum.education_level} preparation level.`
                        : "Generate a custom study blueprint roadmap to begin tracking goals."}
                    </p>
                    {curriculum && (
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                          <span>PROGRESS PERCENTAGE</span>
                          <span>{stats.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                          <motion.div 
                            className="bg-primary h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progressPercentage}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => setActiveTab('curriculum')}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-2xl text-xs hover:opacity-95 shadow-md transition-all cursor-pointer"
                    >
                      <span>{curriculum ? 'View Study Outline' : 'Generate Blueprint'}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Achievements Showcase */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-text-primary">Achievements Showcase</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {badgesList.map(b => {
                      const Icon = b.icon
                      const isUnlocked = !!stats.unlockedBadges[b.id]
                      return (
                        <div 
                          key={b.id} 
                          className={`bg-card border rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all ${
                            isUnlocked 
                              ? 'border-primary/40 shadow-md shadow-primary/5 opacity-100' 
                              : 'border-border opacity-40'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border ${
                            isUnlocked 
                              ? 'bg-primary/10 border-primary/20 text-primary' 
                              : 'bg-background border-border text-text-secondary'
                          }`}>
                            <Icon size={20} />
                          </div>
                          
                          <div>
                            <h4 className="font-extrabold text-[11px] text-text-primary leading-tight">{b.name}</h4>
                            <p className="text-[9px] text-text-secondary leading-normal mt-1 min-h-[32px] line-clamp-3">{b.desc}</p>
                          </div>
                          
                          <span className={`inline-block w-full mt-3 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            isUnlocked 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-background text-text-secondary border border-border/60'
                          }`}>
                            {isUnlocked ? 'Unlocked 🏆' : 'Locked 🔒'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 1. STUDY BLUEPRINT / GENERATOR ── */}
            {activeTab === 'curriculum' && (
              <motion.div
                key="curriculum"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 text-left"
              >
                {!curriculum && !loading && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <h1 className="text-xl md:text-2xl font-black text-text-primary">Create Your Study Blueprint</h1>
                      <p className="text-xs text-text-secondary mt-1">Configure your targets and generate a customized AI learning outline.</p>
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
                            <label className="text-[10px] font-bold text-primary uppercase tracking-widest font-sans">Enter Custom Skill / Domain</label>
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
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Target Objective</label>
                          <div className="relative">
                            <select className={selectCls} value={form.level} onChange={handleFieldChange('level')} required>
                              <option value="" disabled>Select Education Level</option>
                              {['Bootcamp', 'Professional Certificate', 'Diploma', 'Bachelor Preparation', 'Master Spec'].map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        {/* Semesters field aligned to match faculty */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Roadmap Semesters</label>
                          <div className="relative">
                            <select className={selectCls} value={form.semesters} onChange={handleFieldChange('semesters')} required>
                              <option value="" disabled>Select Number of Semesters</option>
                              {['2', '4', '6', '8', 'Custom Duration'].map(o => (
                                <option key={o} value={o}>
                                  {o === 'Custom Duration' ? 'Custom Duration' : `${o} Semesters`}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        {/* Custom duration fields */}
                        {form.semesters === 'Custom Duration' && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Number of Semesters (1-8)</label>
                            <input
                              type="number"
                              value={form.customSemesters}
                              onChange={handleFieldChange('customSemesters')}
                              placeholder="e.g. 5"
                              min="1"
                              max="8"
                              required
                              className={inputCls}
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Weekly Study Hours</label>
                          <div className="relative">
                            <select className={selectCls} value={form.weeklyHours} onChange={handleFieldChange('weeklyHours')} required>
                              <option value="" disabled>Select Weekly Study Hours</option>
                              {['10', '15', '20', '30'].map(o => (
                                <option key={o} value={o}>{o} hrs/week</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                          </div>
                        </div>

                        {/* Industry Focus Field with Other */}
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Industry Application Focus</label>
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
                            <label className="text-[10px] font-bold text-primary uppercase tracking-widest font-sans">Enter Custom Industry Focus</label>
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
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Learning Strategy</label>
                          <div className="relative">
                            <select className={selectCls} value={form.curriculumType} onChange={handleFieldChange('curriculumType')} required>
                              <option value="" disabled>Select Curriculum Type</option>
                              {['Project-Based', 'Theory + Practical', 'Research-Focused'].map(o => (
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
                        <span>Generate Study Blueprint</span>
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
                        <h3 className="text-base font-extrabold text-text-primary">Assembling Study Planner...</h3>
                        <p className="text-[10px] text-text-secondary font-semibold mt-0.5">Customizing modules for {form.skill === 'Other' ? form.customSkill : form.skill}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Structuring curriculum semesters', icon: Terminal },
                        { label: 'Building unit-by-unit descriptions (max 5 per sem)', icon: Layers },
                        { label: 'Mapping Bloom\'s level taxonomy badges', icon: Calendar },
                        { label: 'Attaching LeetCode, GitHub and YouTube resources', icon: CheckCircle2 }
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

                {/* Blueprint Render Preview */}
                {curriculum && !loading && (
                  <div className="space-y-8">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
                      <div>
                        <span className="text-xs font-bold text-primary bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Active Blueprint
                        </span>
                        <h1 className="text-2xl font-black text-text-primary mt-2">{curriculum.program_name}</h1>
                        <p className="text-xs text-text-secondary mt-0.5">{curriculum.program_duration} · {curriculum.industry_focus} Application · {curriculum.weekly_hours} hrs/week</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadBlueprintPDF}
                          disabled={blueprintPdfDownloading}
                          className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Download size={13} className={blueprintPdfDownloading ? 'animate-bounce' : ''} />
                          <span>{blueprintPdfDownloading ? 'Downloading...' : 'Download PDF'}</span>
                        </button>
                        <button
                          onClick={() => setCurriculum(null)}
                          className="px-4 py-2.5 bg-card border border-border text-xs font-bold rounded-xl hover:border-primary/40 text-text-secondary hover:text-primary transition-all cursor-pointer"
                        >
                          Change Study Path
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-text-secondary uppercase">Semesters</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.semesters.length}</p>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-text-secondary uppercase">Total Credits</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.stats.totalCredits}</p>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-text-secondary uppercase">Quality Score</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.quality_score}%</p>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-bold text-text-secondary uppercase">Cognitive Units</p>
                        <p className="text-xl font-black text-text-primary mt-1">{curriculum.stats.totalUnits}</p>
                      </div>
                    </div>

                    {/* Semester & Unit roadmaps */}
                    <div className="space-y-6">
                      <h2 className="text-base font-extrabold text-text-primary">Blueprint Breakdown</h2>
                      
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
                                <h3 className="text-sm font-extrabold text-text-primary mt-1">{sem.theme}</h3>
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
                                        <span className="text-[9px] font-bold text-primary bg-primary/8 border border-primary/15 px-1.5 py-0.5 rounded-full">
                                          {unit.blooms_taxonomy}
                                        </span>
                                      </div>
                                      <h4 className="font-bold text-sm text-text-primary mt-1.5">{unit.name}</h4>
                                      <p className="text-[11px] text-text-secondary leading-relaxed mt-2 line-clamp-2">{unit.description}</p>
                                    </div>
                                  </div>

                                  <div className="h-px bg-border/60" />

                                  <div className="flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-primary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>📚</span>
                                      <span>{unit.topics?.length || 0} Topics</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-primary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>🎯</span>
                                      <span>{unit.learning_outcomes?.length || 0} Outcomes</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-primary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
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
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-primary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
                                      <span>🧪</span>
                                      <span>{unit.practice_activities?.length || 0} Activities</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-background hover:bg-bg-primary border border-border rounded-full text-[9px] font-bold text-text-secondary transition-all hover:scale-[1.03] shadow-sm">
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

            {/* ── SYLLABUS RESOURCES EXPLORER ── */}
            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-4xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">Syllabus Resources Explorer</h1>
                  <p className="text-xs text-text-secondary mt-1">Explore video courses, textbooks, GitHub repos, and official developer documentation linked to your study blueprint.</p>
                </div>

                {!curriculum ? (
                  <div className="bg-card border border-border rounded-2xl p-6 text-center py-12">
                    <AlertCircle size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-text-secondary font-bold">Please generate or load a Study Blueprint first to explore specific resources.</p>
                  </div>
                ) : (() => {
                  const textbooks = []
                  const videos = []
                  const guides = []
                  const repos = []

                  curriculum.semesters.forEach(sem => {
                    sem.units.forEach(unit => {
                      const res = unit.resources
                      if (res) {
                        const unitContext = `Semester ${sem.semester_number}, Unit ${unit.unit_number}: ${unit.name}`
                        if (res.book) {
                          textbooks.push({ unitContext, name: res.book })
                        }
                        if (res.youtube) {
                          videos.push({ unitContext, name: res.youtube.name, url: res.youtube.url })
                        }
                        if (res.google) {
                          guides.push({ unitContext, name: res.google.name, url: res.google.url })
                        }
                        if (res.github) {
                          repos.push({ unitContext, name: res.github.name, url: res.github.url })
                        }
                      }
                    })
                  })

                  return <ResourcesView textbooks={textbooks} videos={videos} guides={guides} repos={repos} />
                })()}
              </motion.div>
            )}

            {/* ── 2. PRACTICE QUIZZES TAB ── */}
            {activeTab === 'practice' && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-4xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">Practice Quizzes</h1>
                  <p className="text-xs text-text-secondary mt-1">Configure study exam sets directly to test your comprehension and get instant review.</p>
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
                      onClick={() => setActiveTab('curriculum')}
                      className="px-6 py-3 gradient-bg text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-xs btn-premium"
                    >
                      Create Study Blueprint
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-[35fr_65fr] gap-6">
                    
                    {/* Setup Quiz Form */}
                    <form onSubmit={handleGenerateQuiz} className="bg-card border border-border rounded-2xl p-5 space-y-4 h-fit shadow-sm">
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Practice Parameters</h3>
                      
                      {/* Question Count */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Question Count</label>
                        <div className="relative">
                          <select 
                            className={selectCls} 
                            value={quizForm.count} 
                            onChange={e => setQuizForm(q => ({ ...q, count: e.target.value }))}
                          >
                            {['5', '10', '15', '20', '25', '30', 'Custom'].map(cnt => (
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
                            {['Practice Quiz', 'Mock Test', 'Unit Preparation Quiz', 'Semester Preparation Quiz', 'Interview Preparation Quiz'].map(mode => (
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
                        {quizLoading ? 'Generating Questions...' : 'Generate Practice Quiz'}
                      </button>

                    </form>

                  {/* Quiz Preview/Workspace */}
                  <div className="space-y-6">
                    {quizLoading && (
                      <div className="bg-card border border-border rounded-2xl p-6 text-center py-20 animate-pulse">
                        <Clock className="animate-spin text-primary mx-auto mb-3" size={24} />
                        <p className="text-xs font-bold text-text-primary">Generating questions...</p>
                        <p className="text-[10px] text-text-secondary mt-1">Integrating MCQ, True/False, Scenario and Short formats.</p>
                      </div>
                    )}

                    {quizEvaluating && (
                      <div className="bg-card border border-border rounded-2xl p-6 text-center py-20 shadow-sm">
                        <Sparkles className="animate-pulse text-primary mx-auto mb-3" size={24} />
                        <p className="text-xs font-bold text-text-primary">Evaluating answers with Groq AI...</p>
                        <p className="text-[10px] text-text-secondary mt-1">Analyzing concepts, keyword metrics, and detailing custom grading feedback.</p>
                      </div>
                    )}

                    {!quizLoading && !quizEvaluating && quizQuestions && !quizSubmitted && (
                      <form onSubmit={handleSubmitQuiz} className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                        <div className="flex justify-between items-center border-b border-border pb-3">
                          <div>
                            <span className="text-[9px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded uppercase tracking-wider">
                              Active Practice Quiz ({quizQuestions.length} Questions)
                            </span>
                            <h3 className="font-bold text-sm text-text-primary mt-1">{curriculum.program_name}</h3>
                            <p className="text-[10px] text-text-secondary">Curriculum-wide Quiz · Difficulty: {quizForm.difficulty} · Mode: {quizForm.quizMode}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={handleDownloadQuizQuestionPaper}
                              className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Download Paper
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadQuizAnswerKey}
                              className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Download Key
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizQuestions(null)}
                              className="px-3 py-1.5 bg-background border border-border text-[10px] font-bold rounded-lg hover:border-red-500/20 hover:text-red-500 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        {/* Questions list */}
                        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
                          {quizQuestions.map((q, idx) => {
                            const studentAns = quizAnswers[q.id]
                            
                            return (
                              <div key={q.id} className="space-y-3 text-xs border-b border-border/40 pb-5 last:border-b-0 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-text-primary">{idx + 1}.</span>
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-[4px] text-[8px] font-bold uppercase tracking-wider">{q.type}</span>
                                </div>
                                <p className="font-semibold text-text-primary pl-1">{q.question}</p>
                                
                                <div className="pl-1">
                                  {(q.type === 'Short Answer' || q.type === 'Fill in the Blanks') ? (
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        className={inputCls}
                                        placeholder={q.type === 'Fill in the Blanks' ? "Fill in the blank space..." : "Type your short response (2-3 sentences) here..."}
                                        value={studentAns || ''}
                                        onChange={(e) => setQuizAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                        required
                                      />
                                    </div>
                                  ) : (q.type === 'Descriptive' || q.type === 'Long Answer' || q.type === 'Case Study' || q.type === 'Interview Style' || q.type === 'Scenario Based' || q.type === 'Interview Questions') ? (
                                    <div className="space-y-1">
                                      <textarea
                                        className="w-full text-xs p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        rows={5}
                                        placeholder="Provide a detailed multi-line essay response outlining system structures, design patterns, lifecycle phases, and scaling trade-offs..."
                                        value={studentAns || ''}
                                        onChange={(e) => setQuizAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                        required
                                      />
                                    </div>
                                  ) : q.type === 'Application Based' ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase">Language:</label>
                                        <select
                                          className="px-2 py-1 text-[11px] font-bold border border-border bg-card rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                                          value={studentAns?.language || 'Python'}
                                          onChange={(e) => {
                                            const code = studentAns?.code || ''
                                            setQuizAnswers(a => ({ ...a, [q.id]: { language: e.target.value, code } }))
                                          }}
                                        >
                                          {['Python', 'Java', 'C++', 'JavaScript'].map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <textarea
                                        className="w-full font-mono text-[11px] p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        rows={6}
                                        placeholder="Write your program code or application implementation details here..."
                                        value={studentAns?.code || (typeof studentAns === 'string' ? studentAns : '')}
                                        onChange={(e) => {
                                          const lang = studentAns?.language || 'Python'
                                          setQuizAnswers(a => ({ ...a, [q.id]: { language: lang, code: e.target.value } }))
                                        }}
                                        required
                                      />
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                      {q.options.map((opt, oIdx) => {
                                        const isSelected = studentAns === oIdx
                                        return (
                                          <button
                                            type="button"
                                            key={oIdx}
                                            onClick={() => handleSelectOption(q.id, oIdx)}
                                            className={`p-3 rounded-xl border text-left text-xs font-medium cursor-pointer transition-all ${
                                              isSelected
                                                ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm'
                                                : 'bg-background hover:bg-card border-border text-text-secondary hover:text-text-primary'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-primary bg-primary text-white' : 'border-border'}`}>
                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                              </div>
                                              <span>{opt}</span>
                                            </div>
                                          </button>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-border">
                          <button
                            type="submit"
                            disabled={!isAllAnswered || quizEvaluating}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer shadow-md flex items-center gap-2"
                          >
                            {quizEvaluating ? 'Evaluating with Groq AI...' : 'Submit Answers'}
                          </button>
                        </div>
                      </form>
                    )}

                    {!quizLoading && quizQuestions && quizSubmitted && quizResult && (() => {
                      const details = getPerformanceDetails(quizResult.percentage)
                      const radius = 60
                      const circumference = 2 * Math.PI * radius
                      const strokeDashoffset = circumference - (quizResult.percentage / 100) * circumference
                      
                      return (
                        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden text-left">
                          
                          {/* Pure React Confetti particles render */}
                          {particles.map(p => (
                            <div
                              key={p.id}
                              className="fixed pointer-events-none"
                              style={{
                                left: `${p.x}vw`,
                                top: `${p.y}vh`,
                                width: `${p.size}px`,
                                height: `${p.size * 1.5}px`,
                                backgroundColor: p.color,
                                transform: `rotate(${p.tilt}deg)`,
                                opacity: 0.8,
                                zIndex: 100,
                                animation: `fall ${p.duration}s linear ${p.delay}s infinite normal`
                              }}
                            />
                          ))}
                          
                          <style>{`
                            @keyframes fall {
                              0% {
                                transform: translateY(0) rotate(0deg);
                                opacity: 1;
                              }
                              100% {
                                transform: translateY(110vh) rotate(720deg);
                                opacity: 0;
                              }
                            }
                          `}</style>

                          <div className="flex flex-col items-center text-center py-4 border-b border-border">
                            {/* Animated success badge and progress ring */}
                            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                              <svg className="absolute w-full h-full -rotate-90">
                                <circle
                                  cx="72"
                                  cy="72"
                                  r={radius}
                                  className="stroke-background"
                                  strokeWidth="10"
                                  fill="transparent"
                                />
                                <motion.circle
                                  cx="72"
                                  cy="72"
                                  r={radius}
                                  className="stroke-primary"
                                  strokeWidth="10"
                                  fill="transparent"
                                  strokeDasharray={circumference}
                                  initial={{ strokeDashoffset: circumference }}
                                  animate={{ strokeDashoffset }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  strokeLinecap="round"
                                />
                              </svg>
                              
                              <div className="z-10 text-center">
                                <span className="text-3xl font-black text-text-primary">{quizResult.percentage}%</span>
                                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">Score</p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border ${details.color}`}>
                                {details.level}
                              </span>
                              <h2 className="text-xl font-black text-text-primary mt-2">{details.celebration}</h2>
                              <p className="text-xs text-text-secondary font-medium">{details.subText}</p>
                            </div>
                          </div>

                          {/* Evaluation Metrics Cards Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-background border border-border rounded-2xl p-5 text-center">
                            <div>
                              <span className="text-xl font-black text-text-primary">{quizResult.total}</span>
                              <p className="text-[9px] font-bold text-text-secondary uppercase mt-1">Total Questions</p>
                            </div>
                            <div>
                              <span className="text-xl font-black text-emerald-500">{quizResult.score}</span>
                              <p className="text-[9px] font-bold text-emerald-500/80 uppercase mt-1">Correct Answers</p>
                            </div>
                            <div>
                              <span className="text-xl font-black text-rose-500">{quizResult.incorrect}</span>
                              <p className="text-[9px] font-bold text-rose-500/80 uppercase mt-1">Incorrect Answers</p>
                            </div>
                            <div>
                              <span className="text-xl font-black text-primary">{quizResult.percentage}%</span>
                              <p className="text-[9px] font-bold text-primary/80 uppercase mt-1">Percentage</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-xs font-extrabold text-primary truncate block max-w-full">{details.level.split(' ')[0]}</span>
                              <p className="text-[9px] font-bold text-primary/80 uppercase mt-1">Performance</p>
                            </div>
                          </div>

                          {/* Instant AI Feedback */}
                          <div className="bg-background/80 border border-border rounded-2xl p-4 flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Sparkles size={16} className="animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">AI Evaluation Notes</h4>
                              <p className="text-xs text-text-secondary leading-relaxed mt-1 italic">
                                "{quizResult.feedback}"
                              </p>
                            </div>
                          </div>

                          {/* Diagnostic Summary: Strengths, Weaknesses & Revision Topics */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <span>💪 Strength Areas</span>
                              </h4>
                              <ul className="mt-2 space-y-1.5 text-xs text-text-secondary list-disc list-inside">
                                {quizResult.strengthAreas && quizResult.strengthAreas.map((area, aIdx) => (
                                  <li key={aIdx} className="font-semibold text-text-primary">{area}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4">
                              <h4 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                                <span>⚠️ Weak Areas</span>
                              </h4>
                              <ul className="mt-2 space-y-1.5 text-xs text-text-secondary list-disc list-inside">
                                {quizResult.weakAreas && quizResult.weakAreas.map((area, aIdx) => (
                                  <li key={aIdx} className="font-semibold text-text-primary">{area}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="bg-background border border-border rounded-2xl p-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">Recommended Topics for Revision</h4>
                            <div className="mt-3 space-y-2.5">
                              {quizResult.recommendedTopics && quizResult.recommendedTopics.map((topicItem, tIdx) => (
                                <div key={tIdx} className="p-3 bg-card border border-border/80 rounded-xl space-y-1 text-xs">
                                  <div className="flex justify-between items-start">
                                    <span className="font-extrabold text-primary">{topicItem.topic}</span>
                                    <span className="text-[9px] font-bold text-text-secondary bg-background px-2 py-0.5 rounded">{topicItem.reason}</span>
                                  </div>
                                  <p className="text-[11px] text-text-secondary leading-relaxed font-medium italic mt-1">
                                    Suggestion: {topicItem.suggestion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Newly Unlocked Achievement Cards if any */}
                          {quizResult.percentage >= 80 && (
                            <div className="border border-primary/20 bg-primary/5 rounded-2xl p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                                <Trophy size={20} className="animate-bounce" />
                              </div>
                              <div className="text-left">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Achievement Unlocked!</p>
                                <h4 className="text-xs font-extrabold text-text-primary mt-0.5">Scored Above 80%</h4>
                                <p className="text-[10px] text-text-secondary leading-relaxed">Excellent score on your curriculum exam! Badges are logged on your Dashboard.</p>
                              </div>
                            </div>
                          )}

                          {/* Questions Review Mode */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary border-b border-border pb-2">Question Review Mode</h4>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                              {quizResult.reviews.map((q, idx) => {
                                const isCorrect = q.isCorrect
                                let studentAnsText;
                                let correctAnsText;

                                if (q.type === 'Short Answer' || q.type === 'Long Answer' || q.type === 'Descriptive' || q.type === 'Fill in the Blanks' || q.type === 'Case Study' || q.type === 'Interview Style' || q.type === 'Scenario Based' || q.type === 'Interview Questions') {
                                  studentAnsText = q.studentAns || 'No Answer'
                                  correctAnsText = q.options[0]
                                } else if (q.type === 'Application Based') {
                                  const code = q.studentAns?.code || q.studentAns || 'No Code'
                                  const lang = q.studentAns?.language || 'Python'
                                  studentAnsText = `[${lang}] ${code}`
                                  correctAnsText = q.options[0]
                                } else {
                                  studentAnsText = q.options[q.studentAns] || 'No Selection'
                                  correctAnsText = q.options[q.correct]
                                }

                                let cleanCorrectText = correctAnsText || ''
                                cleanCorrectText = cleanCorrectText
                                  .replace('[Expected Concept]: ', '')
                                  .replace('[Expected Word]: ', '')
                                  .replace('[Expected Essay Concept]: ', '')
                                  .replace('[Expected Snippet Guide]: ', '')
                                  .replace('[Expected Rubric]: ', '')
                                  .replace('[Expected Guide]: ', '')
                                  .replace('[Expected Case Study Rubric]: ', '')
                                  .replace('[Expected Interview Guide]: ', '')

                                return (
                                  <div key={q.id} className="text-xs space-y-3.5 border-b border-border/40 pb-5 last:border-b-0 text-left bg-card p-5 rounded-2xl border border-border">
                                    <div>
                                      <span className="text-[9px] font-bold text-text-secondary uppercase">Question:</span>
                                      <p className="font-semibold text-text-primary mt-1">Q{idx + 1}: {q.question}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 pt-2 border-t border-border/40">
                                      <div>
                                        <span className="text-[9px] font-bold text-text-secondary uppercase">Your Answer:</span>
                                        <p className={`text-[10px] mt-0.5 font-medium whitespace-pre-wrap font-mono p-2 bg-background border border-border/50 rounded-lg ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                          {studentAnsText}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-[9px] font-bold text-text-secondary uppercase">Correct Answer:</span>
                                        <p className="text-[10px] mt-0.5 text-text-primary font-medium p-2 bg-background border border-border/50 rounded-lg whitespace-pre-wrap">
                                          {cleanCorrectText}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="pt-1">
                                      <span className="text-[9px] font-bold text-text-secondary uppercase block">Result:</span>
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mt-1 ${isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                                      </span>
                                    </div>


                                    {/* Show Long Answer / Short Answer evaluation details if present */}
                                    {(q.type === 'Descriptive' || q.type === 'Long Answer' || q.type === 'Case Study' || q.type === 'Interview Style' || q.type === 'Scenario Based' || q.type === 'Interview Questions') && q.details && (
                                      <div className="bg-background/80 p-3 rounded-lg border border-border mt-2 space-y-1">
                                        <p className="text-[9px] font-bold text-primary uppercase">Descriptive Evaluation:</p>
                                        <p className="text-[10px] font-medium text-text-primary">Evaluation Score: <span className="font-black">{q.details.score} / 10</span></p>
                                        <p className="text-[10px] text-text-secondary italic">"{q.details.feedback}"</p>
                                        {q.details.missing && q.details.missing.length > 0 && (
                                          <p className="text-[9px] text-amber-500 font-semibold mt-1">Missing Concepts: {q.details.missing.join(', ')}</p>
                                        )}
                                      </div>
                                    )}

                                    {q.type === 'Short Answer' && q.details && (
                                      <div className="bg-background/80 p-2 rounded-lg border border-border mt-2">
                                        <p className="text-[9px] font-bold text-primary uppercase">Keyword Overlap Similarity: <span className="font-black text-text-primary">{q.details.similarity}%</span> (Required 70%+)</p>
                                      </div>
                                    )}

                                    {q.type === 'Application Based' && q.details && (
                                      <div className="bg-background/80 p-2 rounded-lg border border-border mt-2">
                                        <p className="text-[9px] font-bold text-primary uppercase">Code Review: <span className="font-medium text-text-primary">{q.details.feedback}</span></p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 pt-4 border-t border-border">
                            <button
                              onClick={handleDownloadQuizResultReport}
                              className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Download size={13} />
                              <span>Download Result Report</span>
                            </button>
                            <button
                              onClick={() => setQuizQuestions(null)}
                              className="px-5 py-2.5 bg-card border border-border text-text-secondary font-bold rounded-xl text-xs hover:border-primary/45 hover:text-primary transition-all cursor-pointer"
                            >
                              Generate New Practice Quiz
                            </button>
                          </div>
                        </div>
                      )
                    })()}

                    {!quizQuestions && !quizLoading && (
                      <div className="bg-card border border-border rounded-2xl p-6 text-center py-24 text-text-secondary shadow-sm">
                        <BookOpen size={32} className="mx-auto mb-3 text-primary animate-pulse" />
                        <p className="text-xs font-bold">No practice quiz generated yet.</p>
                        <p className="text-[10px] mt-1">Select parameters on the left to synthesize study exam sets.</p>
                      </div>
                    )}

                  </div>

                </div>
              )}
              </motion.div>
            )}

            {/* ── 3. STUDY PLANNER TAB ── */}
            {activeTab === 'planner' && (
              <motion.div
                key="planner"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-3xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">Custom Study Planner</h1>
                  <p className="text-xs text-text-secondary mt-1">Map your curriculum topics into a daily study roadmap milestone.</p>
                </div>

                {!curriculum ? (
                  <div className="bg-card border border-border rounded-2xl p-6 text-center py-12">
                    <AlertCircle size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-text-secondary font-bold">Please generate or load a Study Blueprint first to calculate planner schedules.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-[35fr_65fr] gap-6">
                    
                    {/* Input params */}
                    <form onSubmit={handleGeneratePlanner} className="bg-card border border-border rounded-2xl p-5 space-y-4 h-fit shadow-sm">
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Planner Setup</h3>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Syllabus</label>
                        <p className="text-xs font-bold text-text-primary">{curriculum.program_name}</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Duration Strategy</label>
                        <div className="relative">
                          <select 
                            className={selectCls} 
                            value={plannerDays} 
                            onChange={e => setPlannerDays(e.target.value)}
                          >
                            <option value="30">30 Days (Fast Pace)</option>
                            <option value="60">60 Days (Balanced)</option>
                            <option value="90">90 Days (Deep Study)</option>
                            <option value="Custom">Custom Plan</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                        </div>
                      </div>

                      {/* Custom Plan duration days input */}
                      {plannerDays === 'Custom' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-primary uppercase">Number of Days (1-365)</label>
                          <input
                            type="number"
                            value={customPlannerDays}
                            onChange={e => setCustomPlannerDays(e.target.value)}
                            placeholder="e.g. 45"
                            min="1"
                            max="365"
                            required
                            className={inputCls}
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-95 transition-all text-xs cursor-pointer btn-premium"
                      >
                        Create Milestones Schedule
                      </button>
                    </form>

                    {/* Milestones view */}
                    <div className="space-y-4">
                      {generatedPlan ? (
                        <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center border-b border-border pb-3">
                            <div>
                              <h3 className="font-extrabold text-sm text-text-primary">Your {generatedPlan.totalDays}-Day Learning Plan</h3>
                              <p className="text-[10px] text-text-secondary">Custom generated schedule breakdown</p>
                            </div>
                            <button
                                onClick={handleDownloadPlannerPDF}
                                disabled={plannerPdfDownloading}
                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 mr-2"
                              >
                                <Download size={11} className={plannerPdfDownloading ? 'animate-bounce' : ''} />
                                <span>{plannerPdfDownloading ? 'Downloading...' : 'Download Study Plan PDF'}</span>
                              </button>
                              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase">
                                Active Plan
                              </span>
                          </div>
                          
                          <div className="space-y-5 relative pl-4 border-l border-border max-h-[400px] overflow-y-auto pr-2">
                            {generatedPlan.milestones.map((m, mIdx) => (
                              <div key={mIdx} className="relative space-y-1 text-left">
                                <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-4 border-background flex items-center justify-center" />
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{m.title}</span>
                                  <span className="px-1.5 py-0.5 bg-background border border-border rounded text-[9px] text-text-secondary font-bold uppercase">{m.type}</span>
                                </div>
                                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                  <span>{m.icon}</span>
                                  <span>{m.unitName}</span>
                                </h4>
                                <p className="text-[10px] text-text-secondary leading-relaxed pl-5">{m.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-card border border-border rounded-3xl p-6 text-center py-20 text-text-secondary">
                          <Compass className="text-primary mx-auto mb-2 animate-pulse" size={28} />
                          <p className="text-xs font-bold">No plan generated yet.</p>
                          <p className="text-[10px]">Configure the duration strategy on the left and click generate to map your daily modules.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </motion.div>
            )}

            {/* ── 5. HISTORY TAB ── */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left max-w-4xl mx-auto"
              >
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-text-primary">Saved Roadmaps</h1>
                  <p className="text-xs text-text-secondary mt-1">Review previously created study outlines for self-study and learning path trackers.</p>
                </div>

                {history.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-8 py-20 text-center">
                    <AlertCircle size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-text-secondary font-bold">No roadmaps generated yet by this student.</p>
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
                            <td className="p-4 text-xs font-semibold text-text-secondary">{item.skill || item.domain || 'N/A'}</td>
                            <td className="p-4 text-xs font-semibold text-text-secondary">{item.industry_focus}</td>
                            <td className="p-4 text-xs font-medium text-text-secondary">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-xs text-right space-x-2 shrink-0">
                              <button
                                onClick={() => {
                                  setCurriculum(item)
                                  setActiveTab('curriculum')
                                }}
                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => deleteFromHistory(item.id)}
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

            {/* ── 6. AI PDF TUTOR TAB ── */}
            {activeTab === 'tutor' && (
              <motion.div
                key="tutor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="h-full"
              >
                <ErrorBoundary>
                  <DocMentor />
                </ErrorBoundary>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Gamified popup modal congratulate user for achievements */}
        <AnimatePresence>
          {showBadgePopup && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto border-2 border-primary animate-bounce">
                  <Trophy size={32} />
                </div>
                <div>
                  <span className="text-[9px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase">
                    Badge Earned!
                  </span>
                  <h3 className="text-base font-extrabold text-text-primary mt-2">{showBadgePopup.name}</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {showBadgePopup.desc}
                  </p>
                </div>
                <button
                  onClick={() => setShowBadgePopup(null)}
                  className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-95 transition-all cursor-pointer"
                >
                  Awesome!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* In-App PDF Preview and Export Modal */}
        {isExportOpen && (
          <PDFExportModal 
            isOpen={isExportOpen} 
            onClose={() => setIsExportOpen(false)} 
            pdfData={pendingPDF} 
            title={exportModalTitle} 
          />
        )}

      </div>
    </PageTransition>
  )
}

function ResourcesView({ textbooks, videos, guides, repos }) {
  const [subTab, setSubTab] = useState('textbooks')
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'textbooks', label: 'Recommended Textbooks', count: textbooks.length },
          { id: 'videos', label: 'YouTube Video Courses', count: videos.length },
          { id: 'guides', label: 'Official Documentation & Guides', count: guides.length },
          { id: 'repos', label: 'GitHub Code Repositories', count: repos.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === tab.id
                ? 'bg-primary/15 text-primary border border-primary/20 font-black'
                : 'text-text-secondary hover:bg-card border border-transparent'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {subTab === 'textbooks' && textbooks.map((book, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-start shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <span className="text-[9px] font-semibold text-text-secondary uppercase">{book.unitContext}</span>
              <h4 className="font-bold text-xs text-text-primary mt-1">{book.name}</h4>
              <p className="text-[10px] text-text-secondary mt-1">Recommended academic reference book to cover theoretical questions on this unit.</p>
            </div>
          </div>
        ))}

        {subTab === 'videos' && videos.map((vid, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-start shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Play size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-semibold text-text-secondary uppercase">{vid.unitContext}</span>
              <h4 className="font-bold text-xs text-text-primary mt-1 truncate">{vid.name}</h4>
              <a
                href={vid.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-primary font-bold mt-2 hover:underline cursor-pointer"
              >
                <span>Watch on YouTube</span>
                <ArrowRight size={10} />
              </a>
            </div>
          </div>
        ))}

        {subTab === 'guides' && guides.map((guide, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-start shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-semibold text-text-secondary uppercase">{guide.unitContext}</span>
              <h4 className="font-bold text-xs text-text-primary mt-1 truncate">{guide.name}</h4>
              <a
                href={guide.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-primary font-bold mt-2 hover:underline cursor-pointer"
              >
                <span>View Documentation</span>
                <ArrowRight size={10} />
              </a>
            </div>
          </div>
        ))}

        {subTab === 'repos' && repos.map((repo, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-start shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Terminal size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-semibold text-text-secondary uppercase">{repo.unitContext}</span>
              <h4 className="font-bold text-xs text-text-primary mt-1 truncate">{repo.name}</h4>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-primary font-bold mt-2 hover:underline cursor-pointer"
              >
                <span>Inspect Repository</span>
                <ArrowRight size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
