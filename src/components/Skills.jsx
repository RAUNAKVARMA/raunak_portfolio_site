import SectionReveal from './layout/SectionReveal'
import GlassCard from './ui/GlassCard'

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
  return (
    <section id="skills" className="py-24">
      <SectionReveal className="section-container">
        <div className="mb-10" data-reveal>
          <h2 className="section-title">Skills</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {skillGroups.map((group) => (
            <GlassCard key={group.category} className="p-6" data-reveal>
              <h3 className="font-heading text-xl font-bold text-indigo-300">{group.category}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default Skills
