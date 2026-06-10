import { useEffect, useRef, useState } from 'react'

export default function NeuralCursor() {
  const [enabled, setEnabled] = useState(false)
  const canvasRef = useRef(null)
  
  // Position refs for lerping (trailing effect)
  const mouseRef = useRef({ x: 0, y: 0 })
  const cursorRef = useRef({ x: 0, y: 0 })
  
  // Hover & click states
  const [isHovering, setIsHovering] = useState(false)
  const [isHoveringCard, setIsHoveringCard] = useState(false)
  const clickRippleRef = useRef(0) // 0 to 1 pulse progress
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Detect desktop with fine pointer hover capability & check reduced motion preference
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)

    const checkEnabled = () => {
      setEnabled(hoverQuery.matches && !motionQuery.matches && !isMobileDevice)
    }

    checkEnabled()
    hoverQuery.addEventListener('change', checkEnabled)
    motionQuery.addEventListener('change', checkEnabled)

    // Detect dark mode changes
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    checkDarkMode()

    return () => {
      hoverQuery.removeEventListener('change', checkEnabled)
      motionQuery.removeEventListener('change', checkEnabled)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseDown = () => {
      clickRippleRef.current = 1.0 // Start click ripple animation
    }

    const handleMouseOver = (e) => {
      const target = e.target
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('.cursor-pointer'))
      ) {
        setIsHovering(true)
        if (target.closest('.bg-card') || target.closest('.glass') || target.closest('.hover-lift')) {
          setIsHoveringCard(true)
        }
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
      setIsHoveringCard(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mouseout', handleMouseOut)

    // Seed initial position
    cursorRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mouseout', handleMouseOut)
    }
  }, [enabled])

  // Canvas drawing & animation loop
  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let orbitAngle = 0
    let currentOrbitRadius = 15
    let currentPulseScale = 1.0
    let pulseDirection = 1

    const animate = () => {
      // 1. Lerp cursor position for soft trailing effect
      const dx = mouseRef.current.x - cursorRef.current.x
      const dy = mouseRef.current.y - cursorRef.current.y
      cursorRef.current.x += dx * 0.16
      cursorRef.current.y += dy * 0.16

      // Update canvas position on screen
      canvas.style.transform = `translate3d(${cursorRef.current.x - 60}px, ${cursorRef.current.y - 60}px, 0)`

      // 2. Clear canvas
      ctx.clearRect(0, 0, 120, 120)
      const cx = 60
      const cy = 60

      // 3. Set Colors depending on light/dark theme
      // Dark theme: Purple/Blue AI themed glow
      // Light theme: Slightly darker purple-indigo for visibility
      const themeColor = isDark ? 'rgba(91, 95, 239, 1)' : 'rgba(79, 70, 229, 1)'
      const accentColor = isDark ? 'rgba(34, 211, 238, 1)' : 'rgba(6, 182, 212, 1)'

      // 4. Handle hover calculations
      const targetOrbitRadius = isHovering ? 25 : 15
      currentOrbitRadius += (targetOrbitRadius - currentOrbitRadius) * 0.12

      // Pulse cards hovering effect (pulse once)
      if (isHoveringCard) {
        currentPulseScale += pulseDirection * 0.02
        if (currentPulseScale > 1.4) {
          currentPulseScale = 1.4
          pulseDirection = -1
        } else if (currentPulseScale < 1.0) {
          currentPulseScale = 1.0
          pulseDirection = 0
        }
      } else {
        currentPulseScale += (1.0 - currentPulseScale) * 0.1
        pulseDirection = 1
      }

      // 5. Draw Click Ripple Pulse
      if (clickRippleRef.current > 0.01) {
        ctx.beginPath()
        ctx.arc(cx, cy, (1 - clickRippleRef.current) * 45, 0, Math.PI * 2)
        ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${clickRippleRef.current})` : `rgba(79, 70, 229, ${clickRippleRef.current})`
        ctx.lineWidth = 1.5
        ctx.stroke()
        clickRippleRef.current -= 0.06 // Fade out rate
      }

      // 6. Draw Orbiting Nodes & Connecting Lines
      orbitAngle += isHovering ? 0.045 : 0.025 // Faster on hover
      const orbitNodes = []
      const nodeCount = 4

      for (let i = 0; i < nodeCount; i++) {
        const angle = orbitAngle + (i * Math.PI * 2) / nodeCount
        const nx = cx + Math.cos(angle) * currentOrbitRadius * currentPulseScale
        const ny = cy + Math.sin(angle) * currentOrbitRadius * currentPulseScale
        orbitNodes.push({ x: nx, y: ny })

        // Draw connecting line to center
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(nx, ny)
        ctx.strokeStyle = isDark ? 'rgba(91, 95, 239, 0.25)' : 'rgba(79, 70, 229, 0.22)'
        ctx.lineWidth = isHovering ? 0.75 : 0.5
        ctx.stroke()
      }

      // Draw Orbit Outline ring
      ctx.beginPath()
      ctx.arc(cx, cy, currentOrbitRadius * currentPulseScale, 0, Math.PI * 2)
      ctx.strokeStyle = isDark ? 'rgba(91, 95, 239, 0.08)' : 'rgba(79, 70, 229, 0.06)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // 7. Draw Central Node
      ctx.beginPath()
      ctx.arc(cx, cy, isHovering ? 4.5 : 3.5, 0, Math.PI * 2)
      ctx.fillStyle = themeColor
      ctx.shadowBlur = isHovering ? 14 : 8
      ctx.shadowColor = themeColor
      ctx.fill()
      ctx.shadowBlur = 0 // Reset shadow

      // 8. Draw Orbiting Nodes
      orbitNodes.forEach((node, idx) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, isHovering ? 2.5 : 2.0, 0, Math.PI * 2)
        ctx.fillStyle = idx % 2 === 0 ? themeColor : accentColor
        ctx.shadowBlur = isHovering ? 8 : 4
        ctx.shadowColor = idx % 2 === 0 ? themeColor : accentColor
        ctx.fill()
        ctx.shadowBlur = 0 // Reset shadow
      });

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [enabled, isDark, isHovering, isHoveringCard])

  if (!enabled) return null

  return (
    <>
      {/* Global Cursor Override Style block */}
      <style>{`
        button, a, [role="button"], input, select, textarea, .cursor-pointer, [type="submit"] {
          cursor: none !important;
        }
        html, body {
          cursor: none !important;
        }
      `}</style>
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform"
        style={{
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
        }}
      />
    </>
  )
}
