import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const skillGroups = [
  {
    category: 'AI Systems',
    skills: [
      { name: 'LLMs', value: 95 },
      { name: 'RAG Pipelines', value: 90 },
      { name: 'Computer Vision', value: 85 },
      { name: 'Multi-Agent RL', value: 80 },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Node.js', value: 85 },
      { name: 'REST APIs', value: 90 },
      { name: 'Distributed Systems', value: 80 },
    ],
  },
  {
    category: 'ML/Math',
    skills: [
      { name: 'Reinforcement Learning', value: 80 },
      { name: 'Regression Modeling', value: 85 },
      { name: 'Information Theory', value: 75 },
    ],
  },
  {
    category: 'Tools',
    skills: [
      { name: 'Python', value: 95 },
      { name: 'OpenCV', value: 88 },
      { name: 'Vector DBs', value: 85 },
    ],
  },
]

function Skills() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section className="py-24" ref={ref}>
      <div className="section-container">
        <div className="mb-10">
          <h2 className="section-title text-3xl md:text-5xl">Skill Matrix</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {skillGroups.map((group, index) => (
            <motion.article
              key={group.category}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06, duration: 0.55 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-heading text-2xl font-bold">{group.category}</h3>
              <div className="mt-5 space-y-4">
                {group.skills.map((skill, skillIndex) => (
                  <div key={skill.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="font-mono text-textMuted">{skill.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.value}%` } : {}}
                        transition={{ delay: 0.12 + skillIndex * 0.05, duration: 0.7 }}
                        className="h-full rounded-full bg-accentPrimary shadow-[0_0_10px_rgba(0,212,255,0.55)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
