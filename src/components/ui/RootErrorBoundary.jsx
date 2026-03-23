import { Component } from 'react'

/** Catches render errors (including failed lazy chunks) so the page never goes fully blank. */
export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unknown error' }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100svh] flex-col items-center justify-center bg-[#030712] px-6 text-center text-slate-200">
          <p className="font-heading text-xl text-cyan-300">Something didn&apos;t load</p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Try a hard refresh (Ctrl+Shift+R). If this persists, open the browser console (F12) and
            report the error.
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
