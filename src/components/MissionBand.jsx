import MStripe from './ui/MStripe'

function MissionBand() {
  return (
    <section className="relative border-y border-white/[0.12] bg-black">
      <div className="section-container py-16 sm:py-20">
        <p className="section-eyebrow mb-6 text-center">Mission</p>
        <p className="mx-auto max-w-5xl text-center font-heading text-[clamp(1.5rem,4vw,3rem)] font-bold uppercase leading-[1.1] tracking-[0.06em] text-white">
          Build intelligent systems where research meets production — LLMs, agents, and vision deployed
          at scale.
        </p>
      </div>
      <MStripe />
    </section>
  )
}

export default MissionBand
