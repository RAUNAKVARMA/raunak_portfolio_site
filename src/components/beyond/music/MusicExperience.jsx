import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import MatrixRainCanvas from './MatrixRainCanvas'
import MusicVideoStage from './MusicVideoStage'

function MusicExperience() {
  useDocumentTitle('Music')

  useEffect(() => {
    document.documentElement.classList.add('music-immersive')
    document.body.classList.add('music-immersive')
    return () => {
      document.documentElement.classList.remove('music-immersive')
      document.body.classList.remove('music-immersive')
    }
  }, [])

  return (
    <div className="music-room">
      <MatrixRainCanvas />
      <div className="music-scrim" aria-hidden />

      <Link to="/beyond" className="music-back" data-cursor-hover="true">
        <RiArrowLeftLine aria-hidden />
        <span>Beyond</span>
      </Link>

      <p className="music-kicker">Beyond — Music</p>

      <MusicVideoStage />
    </div>
  )
}

export default MusicExperience
