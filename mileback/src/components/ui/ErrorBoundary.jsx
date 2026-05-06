import { Component } from 'react'
import { RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-2xl font-semibold text-white">Something went wrong</p>
        <p className="text-sm text-surface-400">Your data is safe. Reload to recover.</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary flex items-center gap-2"
        >
          <RotateCcw size={15} /> Reload MileBack
        </button>
      </div>
    )
  }
}
