import { Component } from 'react'

/** Isolates Three.js / postprocessing failures so the rest of the site still renders. */
export default class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.warn('[WebGL backdrop disabled]', error)
    }
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
