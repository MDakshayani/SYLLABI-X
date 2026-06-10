import { motion } from 'framer-motion'

/* Animated SVG roadmap lines for the Workflow / Flow section */
export default function WorkflowRoadmapLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 200"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="roadGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#5B5FEF" stopOpacity="0" />
            <stop offset="30%"  stopColor="#5B5FEF" stopOpacity="0.5" />
            <stop offset="60%"  stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="roadGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#22D3EE" stopOpacity="0" />
            <stop offset="40%"  stopColor="#8B5CF6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5B5FEF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Top arc roadmap line */}
        <path
          d="M 0 80 C 200 20, 400 140, 600 80 C 800 20, 1000 140, 1200 80"
          stroke="url(#roadGrad1)"
          strokeWidth="1"
          opacity="0.10"
        />

        {/* Bottom arc roadmap line */}
        <path
          d="M 0 130 C 200 180, 400 60, 600 130 C 800 180, 1000 60, 1200 130"
          stroke="url(#roadGrad2)"
          strokeWidth="1"
          opacity="0.08"
        />

        {/* Animated flowing dot on top path */}
        <motion.circle r="3" fill="#8B5CF6" opacity="0.4">
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            path="M 0 80 C 200 20, 400 140, 600 80 C 800 20, 1000 140, 1200 80"
          />
        </motion.circle>

        {/* Animated flowing dot on bottom path (opposite direction) */}
        <motion.circle r="2.5" fill="#22D3EE" opacity="0.35">
          <animateMotion
            dur="10s"
            repeatCount="indefinite"
            keyPoints="1;0"
            keyTimes="0;1"
            calcMode="linear"
            path="M 0 130 C 200 180, 400 60, 600 130 C 800 180, 1000 60, 1200 130"
          />
        </motion.circle>

        {/* Dashed horizontal center rail */}
        <motion.line
          x1="0" y1="100" x2="1200" y2="100"
          stroke="#5B5FEF"
          strokeWidth="0.8"
          strokeDasharray="6 18"
          opacity="0.07"
          animate={{ strokeDashoffset: [0, -96] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Node dots at step positions: roughly at x = 100, 300, 500, 700, 900, 1100 */}
        {[100, 300, 500, 700, 900, 1100].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx} cy={100} r={3}
            fill="none"
            stroke={i % 3 === 0 ? '#5B5FEF' : i % 3 === 1 ? '#8B5CF6' : '#22D3EE'}
            strokeWidth="1"
            opacity="0.12"
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          />
        ))}
      </svg>
    </div>
  )
}
