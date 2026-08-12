const curiosities = ['Cars', 'Cricket', 'Sketchbooks', 'Cameras', 'Rabbit holes']

function InterestsHero() {
  return (
    <header
      data-fluid-zone="rich"
      className="beyond-hero relative flex min-h-[min(78svh,42rem)] flex-col justify-end overflow-hidden pb-14 pt-28 sm:min-h-[min(88svh,48rem)] sm:pb-20 sm:pt-32"
    >
      <div className="beyond-hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="beyond-hero-vignette pointer-events-none absolute inset-0" aria-hidden />

      <div className="studio-container relative z-[1]">
        <p className="beyond-hero-eyebrow">Beyond Work</p>
        <h1 className="beyond-hero-title">Things that make me curious.</h1>
        <p className="beyond-hero-lede">
          Cars, cricket, sketchbooks, cameras, and whatever rabbit hole I&apos;ve fallen into lately.
        </p>

        <ul className="beyond-hero-chips" aria-label="Current curiosities">
          {curiosities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </header>
  )
}

export default InterestsHero
