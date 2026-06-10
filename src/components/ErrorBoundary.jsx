import React from 'react'
import { AlertCircle } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-card border border-border rounded-3xl p-8 text-center py-20 max-w-xl mx-auto my-12 space-y-4 shadow-md text-text-secondary">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="font-extrabold text-base text-text-primary">Unable to load the PDF Assistant</h3>
          <p className="text-xs leading-relaxed">
            The PDF Tutor encountered a runtime crash. This might be due to a corrupted file structure or browser memory limits.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
          >
            Reset Tutor
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
