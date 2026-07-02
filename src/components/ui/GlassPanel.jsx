function GlassPanel({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component className={`glass-panel ${className}`.trim()} {...props}>
      {children}
    </Component>
  )
}

export default GlassPanel
