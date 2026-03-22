import { useEffect, useState } from 'react'

const command = '$ cat raunak.json'

const jsonOutput = `{
  "role": "AI Engineer & Researcher",
  "focus": ["LLMs", "Multi-Agent Systems", "Computer Vision"],
  "certified": "Project Manager - BITSOM",
  "publications": 4,
  "startups": 2,
  "status": "Ready to build 🚀"
}`

function TerminalWindow() {
  const [content, setContent] = useState('')
  const fullContent = `${command}\n${jsonOutput}`

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index += 1
      setContent(fullContent.slice(0, index))
      if (index >= fullContent.length) clearInterval(interval)
    }, 22)

    return () => clearInterval(interval)
  }, [fullContent])

  return (
    <div className="glass-card ring-accent overflow-hidden rounded-2xl shadow-card">
      <div className="flex items-center gap-2 border-b border-borderColor bg-black/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
      </div>
      <div className="min-h-[270px] bg-[#070b12] p-5 font-mono text-sm text-[#9ed8ff] sm:text-base">
        <pre className="whitespace-pre-wrap break-words">
          {content}
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accentPrimary align-middle" />
        </pre>
      </div>
    </div>
  )
}

export default TerminalWindow
