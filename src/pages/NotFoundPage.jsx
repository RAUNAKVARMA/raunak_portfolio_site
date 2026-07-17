import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center pt-24">
      <div className="section-container text-center">
        <p className="section-eyebrow">Error 404</p>
        <h1 className="mt-6 font-heading text-4xl font-bold uppercase tracking-wide sm:text-5xl">
          Lost In Space
        </h1>
        <p className="mt-6 font-light text-textMuted">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          to="/"
          data-cursor-hover="true"
          className="ghost-btn mt-10"
        >
          Back Home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
