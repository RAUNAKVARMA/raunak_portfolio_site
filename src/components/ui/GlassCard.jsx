function GlassCard({ className = '', children, cursorLabel, ...props }) {
  return (
    <div
      className={`glass-card ${className}`.trim()}
      data-cursor-hover="true"
      {...(cursorLabel ? { 'data-cursor-label': cursorLabel } : {})}
      {...props}
    >
      {children}
    </div>
  )
}

export default GlassCard
