const links = [
  { label: 'Home', href: '#hero' },
  { label: 'Projects', href: '#projects' },
  { label: 'Research', href: '#research' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0b1224]/80 py-6 shadow-[0_-20px_60px_rgba(88,28,135,0.12)] backdrop-blur-sm">
      <div className="section-container grid items-center gap-3 text-sm text-textMuted md:grid-cols-3">
        <p className="text-center md:text-left">Built by Raunak Varma</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-cyan-300">
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
