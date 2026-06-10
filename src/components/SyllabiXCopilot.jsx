import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'

// Retrieve Groq API key from Vite environment
const getApiKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || ''
}

const OUT_OF_SCOPE_RESPONSE = "I am SyllabiX Copilot. I can assist only with platform features, curriculum generation, study planning, AI PDF Tutor, quizzes, exports, and other SyllabiX workflows."

// Basic list of keywords that indicate platform relevancy
const IN_SCOPE_KEYWORDS = [
  'syllabix', 'copilot', 'faculty', 'curriculum', 'syllabus', 'semester', 'unit', 
  'quiz', 'history', 'export', 'student', 'blueprint', 'planner', 'roadmap', 
  'tutor', 'docmentor', 'pdf', 'profile', 'auth', 'login', 'signup', 'theme', 
  'firebase', 'granite', 'groq', 'llama', 'lms', 'accreditation', 'bloom', 'badge', 'streak'
]

export default function SyllabiXCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am SyllabiX Copilot. How can I help you navigate the platform, generate curricula, configure quizzes, or build study roadmaps today?'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Welcome popup triggers on fresh sessions after 1.5 seconds
  useEffect(() => {
    const isShown = sessionStorage.getItem('syllabix_chat_intro_shown') === 'true'
    if (!isShown && !isOpen) {
      const timer = setTimeout(() => {
        setShowWelcome(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const dismissWelcome = (startChat = false) => {
    setShowWelcome(false)
    sessionStorage.setItem('syllabix_chat_intro_shown', 'true')
    if (startChat) {
      setIsOpen(true)
    }
  }

  const checkScopeClient = (text) => {
    const lower = text.toLowerCase()
    if (lower.trim().length < 3) return true
    return IN_SCOPE_KEYWORDS.some(keyword => lower.includes(keyword))
  }

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input
    if (!prompt.trim()) return

    if (!textToSend) {
      setInput('')
    }

    // Append user message
    const newMessages = [...messages, { role: 'user', content: prompt }]
    setMessages(newMessages)
    setLoading(true)

    // Stage 1: Quick Client-Side Scope Filter
    const isRelevant = checkScopeClient(prompt)
    if (!isRelevant) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: OUT_OF_SCOPE_RESPONSE
        }])
        setLoading(false)
      }, 300)
      return
    }

    try {
      const apiKey = getApiKey()
      const historyContext = newMessages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')

      const systemInstruction = `You are "SyllabiX Copilot", the official AI platform assistant for SyllabiX (AI-Powered Curriculum & Learning Intelligence Platform).

Allowed topics to guide and explain:
- Faculty Workspace (curriculum builder, Bloom's Taxonomy progression, Quality Scoreboard audits, industry skill gaps)
- Quiz Generation (Groq quizzes, exam formats, answer evaluation rubrics)
- Exports Manager (PDF handbook creation, metadata formats, JSON backups)
- Student Hub (study blueprints, check-in trackers, gamified badges/streaks)
- Study Planner (30/60/90 days customized roadmap generators)
- AI PDF Tutor / DocMentor (PDF uploads up to 50MB, semantic RAG search context)
- Profile & Settings (editing avatar, passwords, notifications, theme system toggle)
- Technical Stack & Integrations (Firebase Google Auth, Flask API endpoints, SQLite tables, Granite and Groq models)

STRICT INSTRUCTIONS:
- You must ONLY answer questions directly related to SyllabiX workflows, layouts, configurations, and technology stack.
- You must NOT answer general knowledge queries (e.g. general science, history, unrelated math, current events, or coding tasks unrelated to SyllabiX).
- If the user's question is OUTSIDE these bounds, you must respond EXACTLY with:
"${OUT_OF_SCOPE_RESPONSE}"
Do not add any explanations, preambles, or conversational transitions if rejecting. Output exactly the requested fallback sentence.
- For valid queries, keep responses concise, bulleted, and professional, finishing in under 150 words.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Conversation History:\n${historyContext}\n\nCurrent Question: ${prompt}` }
          ],
          max_tokens: 300,
          temperature: 0.2
        })
      })

      if (!response.ok) {
        throw new Error("API call failed")
      }

      const data = await response.json()
      const answer = data.choices?.[0]?.message?.content || OUT_OF_SCOPE_RESPONSE
      
      setMessages(prev => [...prev, { role: 'assistant', content: answer.trim() }])
    } catch (err) {
      console.error("Copilot Error:", err)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I am experiencing connectivity issues. Please verify your internet connection or check the Groq API key configuration." 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button - Pos: Bottom-Right */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen)
          if (showWelcome) dismissWelcome(false)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileActive={{ scale: 0.9 }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 4px 20px -2px var(--accent-color-btn-shadow)',
            '0 8px 30px 4px var(--accent-color-btn-shadow)',
            '0 4px 20px -2px var(--accent-color-btn-shadow)'
          ]
        }}
        transition={{
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg text-white shadow-2xl flex items-center justify-center cursor-pointer transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={24} />
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-primary animate-ping" />
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && !showWelcome && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="fixed bottom-9 right-24 z-50 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-sm border border-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-lg pointer-events-none select-none"
          >
            Ask SyllabiX AI
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Introduction Popup */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-24 right-6 z-50 max-w-xs w-full bg-card border border-border rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full pointer-events-none" />
            
            <h4 className="text-xs font-black text-text-primary mb-3 flex items-center gap-1.5">
              <span>👋 Welcome to SyllabiX AI Assistant</span>
            </h4>
            
            <p className="text-[11px] text-text-secondary leading-relaxed mb-3 font-semibold">
              I can help you with:
            </p>
            
            <ul className="space-y-1.5 text-[11px] text-text-secondary font-medium mb-5">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>Curriculum Builder</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>Quiz Generator</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>Study Planner</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>AI PDF Tutor</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>Exports & Downloads</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>Website Navigation</span>
              </li>
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => dismissWelcome(true)}
                className="flex-1 py-2 bg-primary hover:opacity-95 text-white font-bold rounded-xl text-[10px] shadow-md shadow-primary/10 transition-all cursor-pointer text-center"
              >
                Start Chat
              </button>
              <button
                onClick={() => dismissWelcome(false)}
                className="flex-1 py-2 border border-border hover:bg-primary/5 text-text-secondary font-bold rounded-xl text-[10px] transition-colors cursor-pointer text-center"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[480px] bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-border/10 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black tracking-wide leading-none text-white">SYLLABIX COPILOT</h4>
                  <p className="text-[9px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    <span>Online Platform Guide</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Message Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed text-left ${
                      m.role === 'user'
                        ? 'gradient-bg text-white font-medium shadow-md shadow-primary/10 rounded-tr-none'
                        : 'bg-card border border-border text-text-primary rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border text-text-secondary rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions action bar */}
            {messages.length === 1 && (
              <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide border-t border-border/40 shrink-0 bg-card">
                {[
                  'What is Student Hub?',
                  'How to export PDF?',
                  'What is DocMentor?'
                ].map(sug => (
                  <button
                    key={sug}
                    onClick={() => handleSend(sug)}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg border border-border text-[9px] font-bold text-text-secondary hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about platform workflows..."
                className="flex-1 bg-bg-secondary text-text-primary text-xs rounded-xl px-3.5 py-2.5 border border-border focus:border-primary focus:outline-none transition-colors"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2.5 gradient-bg text-white rounded-xl hover:brightness-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
