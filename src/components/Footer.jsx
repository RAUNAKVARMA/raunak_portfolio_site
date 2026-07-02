const links = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#030712]/80 py-8 backdrop-blur-sm">
      <div className="section-container grid items-center gap-3 text-sm text-textMuted md:grid-cols-3">
        <p className="text-center md:text-left">Built by Raunak Varma</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              data-cursor-hover="true"
              className="transition-colors hover:text-indigo-300"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-center md:text-right">© {new Date().getFullYear()} Raunak Varma</p>
      </div>
    </footer>
  )
}

export default Footer
