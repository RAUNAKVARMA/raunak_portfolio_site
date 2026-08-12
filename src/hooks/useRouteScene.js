import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSceneProgress } from '../providers/SceneProgressProvider'

const ROUTE_VARIANT = {
  '/': 'home',
  '/about': 'about',
  '/work': 'work',
  '/experience': 'experience',
  '/beyond': 'beyond',
  '/beyond/cars': 'beyond',
  '/beyond/drawing': 'beyond',
  '/beyond/art': 'beyond',
  '/beyond/space': 'beyond',
  '/beyond/editing': 'beyond',
  '/beyond/movies': 'beyond',
  '/contact': 'contact',
}

/** Maps the current pathname to a 3D scene variant. */
export function useRouteScene() {
  const { pathname } = useLocation()
  const { setSceneVariant } = useSceneProgress()

  useEffect(() => {
    setSceneVariant(ROUTE_VARIANT[pathname] || 'home')
  }, [pathname, setSceneVariant])
}

export { ROUTE_VARIANT }
