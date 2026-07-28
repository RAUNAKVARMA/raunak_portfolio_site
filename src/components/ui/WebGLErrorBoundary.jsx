import { Component } from 'react'

/** Isolates Three.js / postprocessing failures so the rest of the site still renders. */
export default class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, resetKey: props.resetKey }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { hasError: false, resetKey: props.resetKey }
    }
    return null
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.warn('[WebGL backdrop disabled]', error)
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
