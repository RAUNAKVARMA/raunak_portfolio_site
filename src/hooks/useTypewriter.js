import { useEffect, useState } from 'react'

export function useTypewriter(words, typingSpeed = 85, deletingSpeed = 45, pause = 1300) {
  const [wordIndex, setWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex % words.length]

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          const next = currentWord.slice(0, currentText.length + 1)
          setCurrentText(next)

          if (next === currentWord) {
            setTimeout(() => setIsDeleting(true), pause)
          }
        } else {
          const next = currentWord.slice(0, currentText.length - 1)
          setCurrentText(next)

          if (next.length === 0) {
            setIsDeleting(false)
            setWordIndex((prev) => (prev + 1) % words.length)
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    )

    return () => clearTimeout(timer)
  }, [currentText, deletingSpeed, isDeleting, pause, typingSpeed, wordIndex, words])

  return currentText
}
