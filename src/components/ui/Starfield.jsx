function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="starfield-layer starfield-layer-1" />
      <div className="starfield-layer starfield-layer-2" />
      <div className="blueprint-grid absolute inset-0 opacity-[0.07]" />
    </div>
  )
}

export default Starfield
