const links = [
  { label: 'Home', href: '#hero' },
  { label: 'Projects', href: '#projects' },
  { label: 'Research', href: '#research' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

function Footer() {
  return (
    <footer className="border-t border-accentPrimary/40 bg-bgSecondary/70 py-6">
      <div className="section-container grid items-center gap-3 text-sm text-textMuted md:grid-cols-3">
        <p className="text-center md:text-left">Built by Raunak Varma</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-accentPrimary">
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-center md:text-right">© 2025</p>
      </div>
    </footer>
  )
}

export default Footer
