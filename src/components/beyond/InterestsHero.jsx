function InterestsHero() {
  return (
    <header className="relative flex min-h-[min(52svh,28rem)] flex-col justify-end pb-12 pt-28 sm:pt-32">
      <div className="studio-container">
        <p className="studio-eyebrow">Beyond Work</p>
        <h1 className="studio-title">The person behind the code</h1>
        <p className="studio-lede">
          Cars, space, drawing, cricket, video editing — the obsessions that sit alongside models and
          papers. Documentation of interests, studies, and values outside shipping product.
        </p>

        <dl className="studio-meta" aria-label="Section metadata">
          <div className="flex gap-2">
            <dt>Audience</dt>
            <dd>visitors · collaborators</dd>
          </div>
          <div className="flex gap-2">
            <dt>Surface</dt>
            <dd>personal index</dd>
          </div>
          <div className="flex gap-2">
            <dt>Status</dt>
            <dd>living document</dd>
          </div>
        </dl>
      </div>
    </header>
  )
}

export default InterestsHero
