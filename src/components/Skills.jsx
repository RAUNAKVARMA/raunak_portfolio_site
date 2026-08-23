const skillGroups = [
  {
    category: 'Languages',
    skills: ['Python', 'C', 'C++', 'TypeScript', 'JavaScript'],
  },
  {
    category: 'AI systems',
    skills: [
      'LLMs',
      'RAG pipelines',
      'Multi-agent systems',
      'LiteLLM',
      'Hugging Face',
      'FAISS',
      'Computer vision',
      'NLP',
    ],
  },
  {
    category: 'ML & modeling',
    skills: [
      'Machine learning',
      'Deep learning',
      'Graph neural networks',
      'Reinforcement learning',
      'Model evaluation',
    ],
  },
  {
    category: 'Frameworks & tools',
    skills: [
      'Next.js',
      'React',
      'FastAPI',
      'PyTorch',
      'TensorFlow',
      'Docker',
      'Git',
      'Tailwind CSS',
    ],
  },
  {
    category: 'Research & methods',
    skills: [
      'Experimental design',
      'Benchmarking',
      'IEEE / Springer writing',
      'Literature review',
      'Ablation studies',
    ],
  },
]

function Skills() {
  return (
    <section id="skills" className="about-doc__skills" aria-labelledby="about-skills-heading">
      <div className="about-doc__skills-head" data-about-reveal>
        <h2 id="about-skills-heading">Stack</h2>
        <p className="about-doc__skills-deck">
          Languages, systems, and methods I ship with.
        </p>
      </div>

      <div className="about-doc__skill-groups">
        {skillGroups.map((group, index) => (
          <article key={group.category} className="about-doc__skill-group">
            <div className="about-doc__skill-group-head">
              <span className="about-doc__skill-group-num" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{group.category}</h3>
            </div>
            <ul className="about-doc__skill-list">
              {group.skills.map((skill) => (
                <li key={skill} className="about-doc__skill-chip">
                  {skill}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Skills
