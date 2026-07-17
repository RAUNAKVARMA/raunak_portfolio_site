import { motion, useReducedMotion } from 'framer-motion'

import MStripe from '../ui/MStripe'



const EASE = [0.16, 1, 0.3, 1]



const reveal = {

  hidden: { opacity: 0, y: 28 },

  visible: (i) => ({

    opacity: 1,

    y: 0,

    transition: { delay: 0.08 + i * 0.08, duration: 0.85, ease: EASE },

  }),

}



function InterestsHero() {

  const prefersReducedMotion = useReducedMotion()



  return (

    <section className="relative flex min-h-[70vh] flex-col justify-end overflow-hidden bg-black">

      <div className="pointer-events-none absolute inset-0 hero-atmosphere" aria-hidden />

      <div className="pointer-events-none absolute inset-0 hero-vignette" aria-hidden />



      <div className="section-container relative z-10 pb-16 pt-32">

        <motion.p

          variants={reveal}

          initial={prefersReducedMotion ? false : 'hidden'}

          animate="visible"

          custom={0}

          className="section-eyebrow"

        >

          Beyond Work

        </motion.p>



        <motion.h1

          variants={reveal}

          initial={prefersReducedMotion ? false : 'hidden'}

          animate="visible"

          custom={1}

          className="mt-6 max-w-3xl font-heading text-[clamp(2.25rem,7vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-[0.04em]"

        >

          The Person

          <br />

          Behind The Code

        </motion.h1>



        <motion.p
          variants={reveal}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          custom={2}
          className="mt-8 max-w-xl text-base font-light leading-relaxed text-textMuted sm:text-lg"
        >
          Cars, space, drawing, cricket — the obsessions that sit alongside models and papers.
          These are the things that keep me curious, competitive, and grounded.
        </motion.p>

      </div>



      <MStripe />

    </section>

  )

}



export default InterestsHero

