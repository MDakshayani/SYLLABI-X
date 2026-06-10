import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Calendar, BookOpen, CheckSquare, FileDown } from 'lucide-react'

/* ── Gradient Blobs ── */
const BLOBS = [
  { color: 'rgba(91,95,239,0.10)',  dark: 'rgba(91,95,239,0.05)',  size: '48vw', top: '-8%',  left: '-6%',  dur: 24, dx: [0,25,-18,12,0],  dy: [0,-28,16,-8,0],   delay: 0   },
  { color: 'rgba(139,92,246,0.10)', dark: 'rgba(139,92,246,0.04)', size: '52vw', top: '30%',  right: '-8%', dur: 28, dx: [0,-20,22,-12,0], dy: [0,18,-26,10,0],   delay: 3   },
  { color: 'rgba(34,211,238,0.07)', dark: 'rgba(34,211,238,0.03)', size: '44vw', bottom:'-8%',left: '12%',  dur: 20, dx: [0,14,-22,16,0],  dy: [0,-18,14,-10,0],  delay: 6   },
  { color: 'rgba(91,95,239,0.06)',  dark: 'rgba(91,95,239,0.02)',  size: '36vw', top: '55%',  left: '38%',  dur: 32, dx: [0,-14,18,-8,0],   dy: [0,22,-16,8,0],    delay: 9   },
]

/* ── Floating Curriculum Cards ── */
const CARDS = [
  { icon: Calendar,    label: 'Semester Planning', color: '#5B5FEF', bg: 'rgba(91,95,239,0.08)',  top: '14%', left: '3%',   floatY: [0,-10,0],  dur: 5.2, delay: 0   },
  { icon: BookOpen,    label: 'Course Design',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', top: '38%', right: '2%',  floatY: [0, 8,0],   dur: 4.8, delay: 0.8 },
  { icon: CheckSquare, label: 'Learning Outcomes', color: '#22D3EE', bg: 'rgba(34,211,238,0.08)', top: '62%', left: '2%',   floatY: [0,-7,0],   dur: 5.6, delay: 1.4 },
  { icon: FileDown,    label: 'PDF Export',        color: '#5B5FEF', bg: 'rgba(91,95,239,0.08)',  top: '22%', right: '1%',  floatY: [0, 9,0],   dur: 4.4, delay: 2.0 },
]

function FloatingCards() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {CARDS.map(({ icon: Icon, label, color, bg, top, left, right, floatY, dur, delay }) => (
        <motion.div
          key={label}
          className="absolute flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm"
          style={{
            top, left, right,
            borderColor: `${color}25`,
            background: `rgba(255,255,255,0.04)`,
            opacity: 0.12,
          }}
          animate={{ y: floatY }}
          transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: bg }}>
            <Icon size={12} style={{ color }} />
          </div>
          <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color }}>
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ── Particle Network Canvas (scoped to a container div) ── */
function ParticleCanvas({ isDark }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, particles = []
    const container = canvas.parentElement
    let w = (canvas.width = container.offsetWidth)
    let h = (canvas.height = container.offsetHeight)

    const ro = new ResizeObserver(() => {
      w = canvas.width = container.offsetWidth
      h = canvas.height = container.offsetHeight
      init()
    })
    ro.observe(container)

    const BASE = isDark ? [139, 92, 246] : [124, 58, 237]

    function init() {
      const count = Math.min(70, Math.floor((w * h) / 14000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.8,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      const [r, g, b] = BASE

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x, dy = p.y - q.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 120) * 0.10})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx = -p.vx
        if (p.y < 0 || p.y > h) p.vy = -p.vy
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},0.08)`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    init(); draw()
    return () => { ro.disconnect(); cancelAnimationFrame(raf) }
  }, [isDark])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}



/* ── Standalone exports for direct use inside sections ── */
export function HeroParticles({ isDark: propDark }) {
  const [isDark, setIsDark] = useState(propDark ?? false)
  useEffect(() => {
    if (propDark !== undefined) return
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    check()
    return () => obs.disconnect()
  }, [propDark])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <ParticleCanvas isDark={isDark} />
    </div>
  )
}

export function GradientBlobs() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 2000], [0, -80])
  const y2 = useTransform(scrollY, [0, 2000], [0,  50])
  const y3 = useTransform(scrollY, [0, 2000], [0, -40])
  const y4 = useTransform(scrollY, [0, 2000], [0,  30])
  const ys = [y1, y2, y3, y4]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[130px]"
          style={{
            width: b.size, height: b.size,
            top: b.top, left: b.left, right: b.right, bottom: b.bottom,
            background: b.color,
            y: ys[i],
          }}
          animate={{ x: b.dx, y: b.dy, scale: [1, 1.1, 0.94, 1.08, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}
    </div>
  )
}

export function AboutFloatingCards() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <FloatingCards />
    </div>
  )
}
