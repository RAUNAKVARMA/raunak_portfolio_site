import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const defaultState = {
  scrollProgress: 0,
  mouse: { x: 0, y: 0 },
  canvasReady: false,
  sectionProgress: {},
  morphProgress: 0,
  contactProgress: 0,
  sceneVariant: 'home',
}

const SceneProgressContext = createContext(null)

export function SceneProgressProvider({ children }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [canvasReady, setCanvasReady] = useState(false)
  const [sectionProgress, setSectionProgressState] = useState({})
  const [morphProgress, setMorphProgress] = useState(0)
  const [contactProgress, setContactProgress] = useState(0)
  const [sceneVariant, setSceneVariant] = useState('home')
  const sectionRefs = useRef({})

  const registerSection = useCallback((id, el) => {
    if (el) sectionRefs.current[id] = el
    else delete sectionRefs.current[id]
  }, [])

  const setSectionProgress = useCallback((id, value) => {
    setSectionProgressState((prev) => {
      if (prev[id] === value) return prev
      return { ...prev, [id]: value }
    })
  }, [])

  const value = useMemo(
    () => ({
      scrollProgress,
      setScrollProgress,
      mouse,
      setMouse,
      canvasReady,
      setCanvasReady,
      sectionProgress,
      setSectionProgress,
      morphProgress,
      setMorphProgress,
      contactProgress,
      setContactProgress,
      sceneVariant,
      setSceneVariant,
      registerSection,
      sectionRefs,
    }),
    [
      scrollProgress,
      mouse,
      canvasReady,
      sectionProgress,
      morphProgress,
      contactProgress,
      sceneVariant,
      registerSection,
      setSectionProgress,
    ],
  )

  return <SceneProgressContext.Provider value={value}>{children}</SceneProgressContext.Provider>
}

export function useSceneProgress() {
  const ctx = useContext(SceneProgressContext)
  if (!ctx) throw new Error('useSceneProgress must be used within SceneProgressProvider')
  return ctx
}

export function useSceneProgressOptional() {
  return useContext(SceneProgressContext)
}

export { defaultState }
