import { Link } from 'react-router-dom'

import { RiArrowRightUpLine } from 'react-icons/ri'

import SectionReveal from '../layout/SectionReveal'

import SectionHeader from '../ui/SectionHeader'

import MStripe from '../ui/MStripe'



const values = [

  { title: 'Curiosity first', text: 'I chase questions before answers — the best ideas start as "what if".' },

  { title: 'Build to learn', text: 'Shipping small things quickly teaches me more than any theory alone.' },

  { title: 'Play the long game', text: 'Whether cricket or research, consistency beats intensity over time.' },

]



function Values() {

  return (

    <section className="border-t border-white/[0.08] py-24">

      <SectionReveal className="section-container">

        <div className="border border-white/[0.12] bg-black" data-reveal>

          <div className="p-8 sm:p-10 lg:p-12">

            <SectionHeader eyebrow="Values" title="What Drives Me" />

            <div className="mt-10 grid gap-px bg-white/[0.08] md:grid-cols-3">

              {values.map((value) => (

                <div key={value.title} className="bg-black p-6">

                  <h3 className="font-heading text-base font-bold uppercase tracking-wide">{value.title}</h3>

                  <p className="mt-3 text-sm font-light leading-relaxed text-textMuted">{value.text}</p>

                </div>

              ))}

            </div>

            <Link

              to="/contact"

              data-cursor-hover="true"

              className="ghost-btn mt-10"

            >

              Let&apos;s connect

              <RiArrowRightUpLine />

            </Link>

          </div>

          <MStripe />

        </div>

      </SectionReveal>

    </section>

  )

}



export default Values

