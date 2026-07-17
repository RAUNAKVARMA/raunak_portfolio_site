import { Link } from 'react-router-dom'
import { RiArrowRightUpLine } from 'react-icons/ri'
import SectionReveal from './layout/SectionReveal'
import SectionHeader from './ui/SectionHeader'

const skillGroups = [
  {
    category: 'Languages',
    skills: ['Python', 'C', 'C++', 'TypeScript', 'JavaScript'],
  },
  {
    category: 'AI Systems',
    skills: [
      'LLMs',
      'RAG Pipelines',
      'Multi-Agent Systems',
      'Prompt Engineering',
      'LiteLLM',
      'Hugging Face',
      'Ollama',
      'NVIDIA NIM',
      'FAISS',
      'FastEmbed',
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
    category: 'Frameworks & Tools',
    skills: [
      'Next.js',
      'React',
      'Node.js',
      'Express.js',
      'FastAPI',
      'Flask',
      'Streamlit',
      'Tailwind CSS',
      'PyTorch',
      'TensorFlow',
      'scikit-learn',
      'PyTorch Geometric',
      'OpenCV',
      'MediaPipe',
      'Pandas',
      'NumPy',
      'FastText',
      'Deep Translate',
      'Docker',
      'Git',
      'GitHub',
    ],
  },
  {
    category: 'Databases & Cloud',
    skills: ['PostgreSQL', 'Vector Databases', 'REST APIs', 'JWT Authentication', 'Vercel', 'Render'],
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

function Skills({ preview = false }) {
  const groups = preview ? skillGroups.slice(0, 2) : skillGroups

  return (
    <section id="skills" className="section-surface border-t border-white/[0.12] py-24">
      <SectionReveal className="section-container">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4" data-reveal>
          <SectionHeader eyebrow="Stack" title="Skills" />
          {preview && (
            <Link
              to="/about"
              data-cursor-hover="true"
              className="link-accent inline-flex items-center gap-1.5"
            >
              View full stack
              <RiArrowRightUpLine />
            </Link>
          )}
        </div>

        <div className="divide-y divide-white/[0.12] border border-white/[0.12]">
          {groups.map((group) => (
            <div
              key={group.category}
              className="grid gap-4 bg-[#0a0a0a] p-6 sm:grid-cols-[200px_1fr] sm:gap-8"
              data-reveal
            >
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-mBlue">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="border border-white/[0.08] px-2.5 py-1 font-mono text-[10px] text-textMuted"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>
    </section>
  )
}

export default Skills
