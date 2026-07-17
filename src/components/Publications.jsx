import { Link } from 'react-router-dom'

import { RiArrowRightUpLine, RiExternalLinkLine } from 'react-icons/ri'

import SectionReveal from './layout/SectionReveal'

import SectionHeader from './ui/SectionHeader'



export const publications = [

  {

    year: '2026',

    items: [

      {

        title:

          'Hybrid Microwave–Resonant Inductive Wireless Charging Method with Oscillation-Enhanced Efficiency for Electric Vehicles',

        venue: 'IEEE Open Access Journal',

        summary:

          'Proposed a hybrid microwave–resonant architecture with oscillation-enhanced wireless power transfer.',

        status: 'Accepted',

        links: [

          { label: 'Journal', url: 'https://open.ieee.org/publishing-options/topical-journals/' },

        ],

      },

      {

        title: 'Meta AI Agents: Multi-Agent Coordination',

        venue:

          'International Conference on Deep Learning Innovations for Smart Humanized AI (DISHA 2026), Jaipur, Rajasthan, India',

        summary:

          'Designed a scalable multi-agent AI framework for collaborative reasoning and autonomous decision-making.',

        status: 'Accepted',

        links: [{ label: 'Conference', url: 'https://www.disha2026.com/' }],

      },

      {

        title:

          'Design and Performance Evaluation of a Hybrid Microwave–Resonant Inductive Wireless Power Transfer Architecture for Intelligent EV Charging Applications',

        venue:

          '8th International Conference on Soft Computing and its Engineering Applications (icSoftComp 2026), Singapore · Springer CCIS',

        summary:

          'Validated a hybrid wireless power transfer architecture using simulation-driven performance optimization.',

        status: 'Accepted',

        links: [{ label: 'Conference', url: 'https://www.icsoftcomp.org/' }],

      },

    ],

  },

  {

    year: '2025',

    items: [

      {

        title:

          'System Design Methodology and Efficiency Optimization of Wireless Charging for Electric Vehicles',

        venue:

          '7th International Conference on Soft Computing and its Engineering Applications (icSoftComp 2025), Hanoi, Vietnam · Springer CCIS',

        summary:

          'Designed and optimized a resonant wireless charging architecture for high-efficiency EV power transfer.',

        status: 'Published',

        links: [

          {

            label: 'Published',

            url: 'https://link.springer.com/chapter/10.1007/978-3-032-22065-3_22#citeas',

          },

          {

            label: 'Certificate',

            url: 'https://drive.google.com/file/d/1qDBN5-whnB5KL2ZLA7zHdzYUCCoiDArf/view?usp=drivesdk',

          },

        ],

      },

      {

        title: 'Wireless Charging for Electric Vehicles: A Comprehensive Review',

        venue:

          '5th International Conference on Smart Systems: Innovations in Computing (SSIC 2025), Sikkim, India',

        summary:

          'Reviewed wireless EV charging technologies, industry standards, and future research opportunities.',

        status: 'Published',

        links: [

          {

            label: 'Paper',

            url: 'https://drive.google.com/file/d/1m3h1w6wZa6JyDmzrGSybhk-fzB7eWyrg/view?usp=drivesdk',

          },

          {

            label: 'Conference',

            url: 'https://jaipur.manipal.edu/fosta/event-details.php?url=584/5th-international-conference-on-smart',

          },

          {

            label: 'Certificate',

            url: 'https://drive.google.com/file/d/1Je_wn4qkPGglSd64NTFLL2bDeBkeAkRS/view?usp=drivesdk',

          },

        ],

      },

    ],

  },

]



function Publications({ preview = false }) {

  const groups = preview ? publications.slice(0, 1) : publications

  const itemLimit = preview ? 2 : Infinity



  return (

    <section id="research" className="section-surface border-t border-white/[0.12] py-24">

      <SectionReveal className="section-container">

        <div className="mb-10 flex flex-wrap items-end justify-between gap-4" data-reveal>

          <SectionHeader eyebrow="03 — Research" title="Publications" />

          {preview && (

            <Link

              to="/experience"

              data-cursor-hover="true"

              className="link-accent inline-flex items-center gap-1.5"

            >

              View all research

              <RiArrowRightUpLine />

            </Link>

          )}

        </div>



        <div className="divide-y divide-white/[0.12] border border-white/[0.12]">

          {groups.map((group) =>

            group.items.slice(0, itemLimit).map((paper) => (

              <article

                key={paper.title}

                className="grid gap-4 bg-[#0a0a0a] p-6 sm:grid-cols-[80px_1fr]"

                data-reveal

              >

                <span className="font-mono text-sm text-textSubtle">{group.year}</span>

                <div>

                  <h4 className="font-heading text-base font-semibold leading-snug sm:text-lg">{paper.title}</h4>

                  <p className="mt-1 text-sm font-light text-textSubtle">{paper.venue}</p>

                  {paper.summary && (

                    <p className="mt-3 text-sm font-light italic text-textMuted">{paper.summary}</p>

                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4">

                    <span className="border border-white/[0.12] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-textMuted">

                      {paper.status}

                    </span>

                    {paper.links.map((link) => (

                      <a

                        key={link.label}

                        href={link.url}

                        target="_blank"

                        rel="noopener noreferrer"

                        data-cursor-hover="true"

                        className="link-accent inline-flex items-center gap-1.5"

                      >

                        <RiExternalLinkLine />

                        {link.label}

                        <RiArrowRightUpLine />

                      </a>

                    ))}

                  </div>

                </div>

              </article>

            )),

          )}

        </div>

      </SectionReveal>

    </section>

  )

}



export default Publications

