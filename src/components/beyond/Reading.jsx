import SectionReveal from '../layout/SectionReveal'

import SectionHeader from '../ui/SectionHeader'



const shelf = [

  { title: 'Deep Learning', by: 'Goodfellow, Bengio, Courville', tag: 'Foundations' },

  { title: 'The Pragmatic Programmer', by: 'Hunt & Thomas', tag: 'Craft' },

  { title: 'Sapiens', by: 'Yuval Noah Harari', tag: 'Perspective' },

  { title: 'Zero to One', by: 'Peter Thiel', tag: 'Startups' },

  { title: 'A Brief History of Time', by: 'Stephen Hawking', tag: 'Space' },

  { title: "Can't Hurt Me", by: 'David Goggins', tag: 'Mindset' },

  { title: 'The Theory of Everything', by: 'Stephen Hawking', tag: 'Physics' },

  { title: 'Atomic Habits', by: 'James Clear', tag: 'Productivity' },

]



const topics = ['Agentic systems', 'RL from human feedback', 'Systems design', 'Space exploration', 'Automotive design', 'Chess theory']



function Reading() {

  return (

    <section className="border-t border-white/[0.08] py-20">

      <SectionReveal className="section-container grid gap-12 lg:grid-cols-2">

        <div data-reveal>

          <SectionHeader eyebrow="Reading" title="On My Shelf" className="mb-8" />

          <div className="divide-y divide-white/[0.08] border border-white/[0.08]">

            {shelf.map((book) => (

              <div key={book.title} className="flex items-center justify-between gap-4 bg-black p-5">

                <div>

                  <h3 className="font-heading text-base font-semibold">{book.title}</h3>

                  <p className="mt-1 text-sm font-light text-textSubtle">{book.by}</p>

                </div>

                <span className="shrink-0 border border-white/[0.12] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-textMuted">

                  {book.tag}

                </span>

              </div>

            ))}

          </div>

        </div>



        <div data-reveal>

          <SectionHeader eyebrow="Curiosity" title="Currently Exploring" className="mb-8" />

          <div className="flex flex-wrap gap-2">

            {topics.map((topic) => (

              <span

                key={topic}

                className="border border-white/[0.1] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-textMuted"

              >

                {topic}

              </span>

            ))}

          </div>

        </div>

      </SectionReveal>

    </section>

  )

}



export default Reading

