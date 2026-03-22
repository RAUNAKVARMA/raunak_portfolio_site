/** Subtle CRT / HUD scanlines — sci-fi atmosphere without killing readability */
function SciFiScanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[38] opacity-[0.065] mix-blend-overlay"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 3px)',
      }}
      aria-hidden
    />
  )
}

export default SciFiScanlines
