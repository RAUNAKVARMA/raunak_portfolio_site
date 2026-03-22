import { useEffect, useState } from 'react'

export function useIsMobileOrTouch() {
  const [isTouchLike, setIsTouchLike] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)')
    const update = () => setIsTouchLike(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isTouchLike
}
