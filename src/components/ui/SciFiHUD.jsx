/** Fixed HUD corners — reads like a cockpit / command UI */
function SciFiHUD() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-hidden>
      <div className="absolute left-3 top-20 h-14 w-14 border-l-2 border-t-2 border-cyan-400/35 shadow-[0_0_30px_rgba(34,211,238,0.15)] sm:left-6 sm:top-24" />
      <div className="absolute right-3 top-20 h-14 w-14 border-r-2 border-t-2 border-fuchsia-400/35 shadow-[0_0_30px_rgba(232,121,249,0.15)] sm:right-6 sm:top-24" />
      <div className="absolute bottom-24 left-3 h-14 w-14 border-b-2 border-l-2 border-fuchsia-400/30 shadow-[0_0_28px_rgba(232,121,249,0.12)] sm:bottom-28 sm:left-6" />
      <div className="absolute bottom-24 right-3 h-14 w-14 border-b-2 border-r-2 border-cyan-400/30 shadow-[0_0_28px_rgba(34,211,238,0.12)] sm:bottom-28 sm:right-6" />
      <div className="absolute left-1/2 top-[72px] hidden h-px w-[min(70%,900px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent md:block" />
    </div>
  )
}

export default SciFiHUD
