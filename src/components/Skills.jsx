import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const skillGroups = [
  {
    category: 'Languages',
    skills: ['Python', 'C', 'C++', 'TypeScript'],
  },
  {
    category: 'AI Systems',
    skills: [
      'LLMs',
      'RAG Pipelines',
      'Multi-Agent Systems',
      'Hugging Face',
      'Computer Vision',
      'NLP',
    ],
  },
  {
    category: 'ML & Modeling',
    skills: [
      'Machine Learning',
      'Deep Learning (CNNs, ResNet, RNNs, LSTMs)',
      'Graph Neural Networks (GNNs)',
      'Reinforcement Learning',
      'Model Evaluation',
    ],
  },
  {
    category: 'Libraries & Tools',
    skills: [
      'PyTorch',
      'TensorFlow',
      'scikit-learn',
      'PyTorch Geometric',
      'FastAPI',
      'Flask',
      'Streamlit',
      'OpenCV',
      'MediaPipe',
      'Pandas',
      'NumPy',
      'FastText',
      'Deep Translate',
      'Ollama',
      'Vector Databases',
    ],
  },
  {
    category: 'Research & Methods',
    skills: [
      'Problem Formulation',
      'Literature Review & Gap Analysis',
      'Experimental Design',
      'Dataset Generation & Preprocessing',
      'Model Benchmarking & Evaluation',
      'Ablation Studies',
      'Performance Optimization',
      'Research Paper Writing (IEEE/Springer/Elsevier)',
    ],
  },
]

function Skills() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section className="sci-fi-section py-24" ref={ref}>
      <div className="section-container">
        <div className="mb-10">
          <h2 className="section-title text-3xl md:text-5xl">Skills</h2>
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
              <h3 className="font-heading text-xl font-bold text-accentPrimary">{group.category}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-borderColor bg-bgSecondary/60 px-3 py-1.5 font-mono text-[11px] text-slate-300"
                  >
                    {skill}
                  </span>
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
