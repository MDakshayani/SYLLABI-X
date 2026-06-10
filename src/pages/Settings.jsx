import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Download, Palette, Check, Sparkles } from 'lucide-react'
import PageTransition from '../components/PageTransition'

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-5">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
      <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-primary/10">
        <Icon size={14} className="text-white" />
      </div>
      <h2 className="font-semibold text-text-primary">{title}</h2>
    </div>
    {children}
  </div>
)

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {desc && <p className="text-xs text-text-secondary mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary shadow-sm shadow-primary/20' : 'bg-border'}`}
      style={{ height: 22 }}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        style={{ width: 18, height: 18 }}
      />
    </button>
  </div>
)

export default function Settings() {
  const [model, setModel] = useState('gpt-4o')
  const [exportFmt, setExportFmt] = useState('PDF')
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    streaming: true,
    autoSave: true,
    prerequisites: true,
    includeTools: true,
    includeOutcomes: true,
    compactPDF: false,
  })

  // Theme & Accent States
  const [theme, setTheme] = useState(() => localStorage.getItem('curriculum-ai-theme') || 'system')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('curriculum-ai-accent-color') || '#5B5FEF')

  const toggle = (k) => setSettings(s => ({ ...s, [k]: !s[k] }))

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Handle Theme switching
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('curriculum-ai-theme', newTheme)
    window.dispatchEvent(new Event('theme-changed'))
  }

  // Handle Accent picker changes
  const handleAccentChange = (color) => {
    setAccentColor(color)
    localStorage.setItem('curriculum-ai-accent-color', color)
    document.documentElement.style.setProperty('--custom-accent-color', color)
    document.documentElement.style.setProperty('--custom-accent-color-hover', color)
    document.documentElement.style.setProperty('--primary-color-val', color)
  }

  return (
    <PageTransition>
      <div className="p-8 max-w-3xl mx-auto bg-transparent text-left">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
          <p className="text-text-secondary text-sm">Configure your AI model and preferences.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="AI Model" icon={Cpu}>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-2 block uppercase tracking-wider">Primary Model</label>
                <div className="flex flex-wrap gap-2.5">
                  {['gpt-4o', 'gpt-4-turbo', 'claude-3.5', 'gemini-1.5'].map(m => (
                    <button
                      key={m}
                      onClick={() => setModel(m)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        model === m
                          ? 'border-primary bg-primary/8 text-primary font-bold'
                          : 'border-border text-text-secondary hover:border-primary/40'
                      }`}
                    >
                      {model === m && <Check size={11} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <Toggle label="Streaming Generation" desc="Show real-time progress while AI generates" checked={settings.streaming} onChange={() => toggle('streaming')} />
              <Toggle label="Auto-save to History" desc="Automatically save all generated curricula" checked={settings.autoSave} onChange={() => toggle('autoSave')} />
              <Toggle label="Enforce Prerequisites" desc="AI will respect course dependency ordering" checked={settings.prerequisites} onChange={() => toggle('prerequisites')} />
            </div>
          </Section>

          <Section title="Export Settings" icon={Download}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-2 block uppercase tracking-wider">Default Export Format</label>
                <div className="flex gap-2">
                  {['PDF', 'JSON', 'Markdown', 'DOCX'].map(f => (
                    <button
                      key={f}
                      onClick={() => setExportFmt(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        exportFmt === f
                          ? 'border-primary bg-primary/8 text-primary font-bold'
                          : 'border-border text-text-secondary hover:border-primary/40'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle label="Include Tools & Resources" checked={settings.includeTools} onChange={() => toggle('includeTools')} />
              <Toggle label="Include Learning Outcomes" checked={settings.includeOutcomes} onChange={() => toggle('includeOutcomes')} />
              <Toggle label="Compact PDF Layout" desc="Smaller font, denser layout for print" checked={settings.compactPDF} onChange={() => toggle('compactPDF')} />
            </div>
          </Section>

          <Section title="Appearance" icon={Palette}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-2 block uppercase tracking-wider">Theme Mode</label>
                <div className="flex gap-2.5">
                  {[
                    { key: 'light', label: 'Light Theme' },
                    { key: 'dark', label: 'Dark Theme' },
                    { key: 'system', label: 'System Defaults' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        theme === key
                          ? 'border-primary bg-primary/8 text-primary font-bold'
                          : 'border-border text-text-secondary hover:border-primary/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary mb-2 block uppercase tracking-wider">Accent Color</label>
                <div className="flex gap-3 items-center">
                  {['#5B5FEF', '#8B5CF6', '#22D3EE', '#10B981', '#F59E0B'].map(c => (
                    <button
                      key={c}
                      onClick={() => handleAccentChange(c)}
                      className={`w-9 h-9 rounded-full border-2 hover:scale-110 transition-transform cursor-pointer shadow-md flex items-center justify-center ${
                        accentColor.toLowerCase() === c.toLowerCase() ? 'border-text-primary ring-2 ring-primary/20 scale-105' : 'border-card'
                      }`}
                      style={{ background: c }}
                    >
                      {accentColor.toLowerCase() === c.toLowerCase() && (
                        <Check size={14} className="text-white drop-shadow-sm font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <button
            onClick={save}
            className="w-full flex items-center justify-center gap-2 py-3.5 gradient-bg text-white font-semibold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm cursor-pointer btn-premium"
          >
            {saved ? <><Check size={16} /> Saved!</> : <><Sparkles size={16} /> Save Settings</>}
          </button>
        </motion.div>
      </div>
    </PageTransition>
  )
}
