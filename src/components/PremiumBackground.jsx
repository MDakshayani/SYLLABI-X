import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

export default function PremiumBackground() {
  const [isDark, setIsDark] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Check dark mode class on documentElement
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    // Initial check
    checkDarkMode()

    return () => {
      observer.disconnect()
    }
  }, [])

  // Canvas particle logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrameId
    let particles = []
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      // Keep density balanced but low
      const count = Math.min(100, Math.floor((width * height) / 13000))
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35, // Slow floating speed
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 0.8, // Slightly smaller particles
          opacity: Math.random() * 0.2 + 0.05, // Lower initial opacity
          opacityDirection: Math.random() > 0.5 ? 1 : -1,
          sizeDirection: Math.random() > 0.5 ? 1 : -1
        })
      }
    }

    initParticles()
    window.addEventListener('resize', handleResize)

    // Base color depending on theme: RGB for canvas fill
    const baseColor = isDark ? [139, 92, 246] : [124, 58, 237]

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw particle links
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        
        // Link to other particles (soft connection web)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Shorter connection reach (100mm/px) and lower line opacity (max 0.08)
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        // Update positions
        p1.x += p1.vx
        p1.y += p1.vy

        // Bounce on borders
        if (p1.x < 0 || p1.x > width) {
          p1.vx = -p1.vx
          p1.x = p1.x < 0 ? 0 : width
        }
        if (p1.y < 0 || p1.y > height) {
          p1.vy = -p1.vy
          p1.y = p1.y < 0 ? 0 : height
        }

        // Animate size (pulse min 0.8, max 2.5)
        p1.radius += p1.sizeDirection * 0.01
        if (p1.radius > 2.5) {
          p1.radius = 2.5
          p1.sizeDirection = -1
        } else if (p1.radius < 0.8) {
          p1.radius = 0.8
          p1.sizeDirection = 1
        }

        // Animate opacity (pulse min 0.05, max 0.3 to keep background soft)
        p1.opacity += p1.opacityDirection * 0.002
        if (p1.opacity > 0.3) {
          p1.opacity = 0.3
          p1.opacityDirection = -1
        } else if (p1.opacity < 0.05) {
          p1.opacity = 0.05
          p1.opacityDirection = 1
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${p1.opacity})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDark])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-background">
      {/* Aurora Waves - Mouse Pos offsets removed for independent slow drift */}
      <motion.div
        animate={{
          scale: [1, 1.12, 0.96, 1.08, 1],
          x: [0, 20, -15, 10, 0],
          y: [0, -30, 15, -10, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[rgba(91,95,239,0.04)] dark:bg-[rgba(91,95,239,0.015)] blur-[150px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.18, 0.92, 1.12, 1],
          x: [0, -25, 20, -10, 0],
          y: [0, 20, -30, 10, 0],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
        className="absolute top-[25%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[rgba(139,92,246,0.04)] dark:bg-[rgba(139,92,246,0.015)] blur-[160px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.08, 0.88, 1.12, 1],
          x: [0, 15, -20, 15, 0],
          y: [0, -20, 15, -10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute bottom-[-10%] left-[10%] w-[55vw] h-[55vw] rounded-full bg-[rgba(34,211,238,0.03)] dark:bg-[rgba(34,211,238,0.01)] blur-[150px]"
      />

      {/* Interactive Canvas Particles Network - Lower opacity checks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full opacity-35 dark:opacity-20"
      />
    </div>
  )
}
