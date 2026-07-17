function SectionHeader({ eyebrow, title, subtitle, align = 'left', className = '' }) {
  const alignClass =
    align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div className={`flex flex-col gap-3 ${alignClass} ${className}`.trim()}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      {title && <h2 className="section-title">{title}</h2>}
      {subtitle && <p className="max-w-2xl text-base font-light leading-relaxed text-textMuted">{subtitle}</p>}
    </div>
  )
}

export default SectionHeader
