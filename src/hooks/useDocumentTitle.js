import { useEffect } from 'react'

const BASE = 'Raunak Varma'

/** Sets the document title per page for SEO/history clarity. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : `${BASE} | AI Engineer & Researcher`
  }, [title])
}
