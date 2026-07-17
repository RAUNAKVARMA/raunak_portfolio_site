import Contact from '../components/Contact'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function ContactPage() {
  useDocumentTitle('Contact')

  return (
    <div className="pt-24 sm:pt-28 bg-black">
      <Contact />
    </div>
  )
}

export default ContactPage
