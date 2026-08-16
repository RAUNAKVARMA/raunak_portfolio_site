import { useEffect, useState } from 'react'

function getIsTouchLike() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches
}

export function useIsMobileOrTouch() {
  const [isTouchLike, setIsTouchLike] = useState(getIsTouchLike)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)')
    const update = () => setIsTouchLike(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isTouchLike
}
