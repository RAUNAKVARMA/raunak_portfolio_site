import { Link } from 'react-router-dom'

import MStripe from './ui/MStripe'



const links = [

  { label: 'Home', to: '/' },

  { label: 'About', to: '/about' },

  { label: 'Work', to: '/work' },

  { label: 'Experience', to: '/experience' },

  { label: 'Beyond', to: '/beyond' },

  { label: 'Contact', to: '/contact' },

]



function Footer() {

  return (

    <footer className="relative bg-black">

      <MStripe />

      <div className="section-container grid items-center gap-6 py-10 text-sm font-light text-textSubtle md:grid-cols-3">

        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] md:text-left">

          Raunak Varma

        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">

          {links.map((link) => (

            <Link

              key={link.to}

              to={link.to}

              data-cursor-hover="true"

              className="font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:text-white"

            >

              {link.label}

            </Link>

          ))}

        </div>

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] md:text-right">

          © {new Date().getFullYear()}

        </p>

      </div>

    </footer>

  )

}



export default Footer

