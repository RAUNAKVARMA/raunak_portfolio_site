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

const topics = [
  'Agentic systems',
  'RL from human feedback',
  'Systems design',
  'Space exploration',
  'Automotive design',
  'Chess theory',
]

function Reading() {
  return (
    <section className="studio-section" aria-labelledby="reading-heading">
      <div className="studio-container grid gap-10 lg:grid-cols-2">
        <div>
          <p className="studio-eyebrow">Reading</p>
          <h2 id="reading-heading" className="studio-title">
            On my shelf
          </h2>
          <p className="studio-lede">Reference list. Long titles wrap; tags stay pinned.</p>

          <div className="mt-6 overflow-x-auto">
            <table className="studio-table min-w-[320px]">
              <caption className="sr-only">Books currently on my shelf</caption>
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Author</th>
                  <th scope="col">Tag</th>
                </tr>
              </thead>
              <tbody>
                {shelf.map((book) => (
                  <tr key={book.title}>
                    <td>{book.title}</td>
                    <td className="text-[color:var(--studio-text-muted)]">{book.by}</td>
                    <td>{book.tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="studio-eyebrow">Curiosity</p>
          <h2 className="studio-title">Currently exploring</h2>
          <p className="studio-lede">Topics under active attention. Empty state: none — always reading.</p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Topics currently exploring">
            {topics.map((topic) => (
              <li key={topic}>
                <span className="studio-chip">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Reading
