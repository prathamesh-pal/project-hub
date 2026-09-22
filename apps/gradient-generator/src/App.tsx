import { useMemo, useState, useCallback } from 'react'

type GradientType = 'linear' | 'radial' | 'conic'

interface Stop {
  id: string
  color: string
  position: number // 0-100
}

const STARTER_STOPS: Stop[] = [
  { id: 's1', color: '#FF4D6D', position: 0 },
  { id: 's2', color: '#3A86FF', position: 100 }
]

const PRESETS: { name: string; stops: Omit<Stop, 'id'>[]; type: GradientType; angle: number }[] = [
  { name: 'Dusk', stops: [{ color: '#FF4D6D', position: 0 }, { color: '#3A86FF', position: 100 }], type: 'linear', angle: 135 },
  { name: 'Citrus', stops: [{ color: '#FFD60A', position: 0 }, { color: '#FF7A00', position: 100 }], type: 'linear', angle: 90 },
  { name: 'Kelp', stops: [{ color: '#0B4F3F', position: 0 }, { color: '#78C091', position: 100 }], type: 'linear', angle: 160 },
  { name: 'Ultraviolet', stops: [{ color: '#3A0CA3', position: 0 }, { color: '#F72585', position: 100 }], type: 'radial', angle: 0 },
  { name: 'Signal', stops: [{ color: '#0F0F0F', position: 0 }, { color: '#00FF87', position: 50 }, { color: '#0F0F0F', position: 100 }], type: 'conic', angle: 0 }
]

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function buildCss(type: GradientType, angle: number, stops: Stop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const stopStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ')
  if (type === 'linear') return `linear-gradient(${angle}deg, ${stopStr})`
  if (type === 'radial') return `radial-gradient(circle, ${stopStr})`
  return `conic-gradient(from ${angle}deg, ${stopStr})`
}

export default function App() {
  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<Stop[]>(STARTER_STOPS)
  const [activeId, setActiveId] = useState<string>(STARTER_STOPS[0].id)
  const [copied, setCopied] = useState(false)

  const gradientValue = useMemo(() => buildCss(type, angle, stops), [type, angle, stops])
  const cssBlock = `background: ${gradientValue};`

  const updateStop = useCallback((id: string, patch: Partial<Stop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const addStop = useCallback(() => {
    setStops((prev) => {
      if (prev.length >= 6) return prev
      const sorted = [...prev].sort((a, b) => a.position - b.position)
      const mid = Math.round((sorted[0].position + sorted[sorted.length - 1].position) / 2)
      const id = makeId()
      setActiveId(id)
      return [...prev, { id, color: '#FFFFFF', position: mid }]
    })
  }, [])

  const removeStop = useCallback((id: string) => {
    setStops((prev) => {
      if (prev.length <= 2) return prev
      const next = prev.filter((s) => s.id !== id)
      setActiveId(next[0].id)
      return next
    })
  }, [])

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    const nextStops = preset.stops.map((s) => ({ ...s, id: makeId() }))
    setType(preset.type)
    setAngle(preset.angle)
    setStops(nextStops)
    setActiveId(nextStops[0].id)
  }, [])

  const copyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssBlock)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }, [cssBlock])

  const sortedStops = [...stops].sort((a, b) => a.position - b.position)

  return (
    <div className="shell">
      <header className="topbar">
        <span className="topbar-mark">Gradient</span>
        <span className="topbar-sub">a small tool for building CSS gradients</span>
      </header>

      <main className="layout">
        <section
          className="preview"
          style={{ background: gradientValue }}
          aria-label="Gradient preview"
        >
          <div className="preview-scale" aria-hidden="true">
            {sortedStops.map((s) => (
              <button
                key={s.id}
                className={`scale-handle${s.id === activeId ? ' is-active' : ''}`}
                style={{ left: `${s.position}%`, background: s.color }}
                onClick={() => setActiveId(s.id)}
                aria-label={`Select stop at ${s.position}%`}
              />
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-group">
            <h2 className="panel-heading">Type</h2>
            <div className="segmented">
              {(['linear', 'radial', 'conic'] as GradientType[]).map((t) => (
                <button
                  key={t}
                  className={`segmented-option${type === t ? ' is-active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {type !== 'radial' && (
            <div className="panel-group">
              <div className="panel-heading-row">
                <h2 className="panel-heading">Angle</h2>
                <span className="panel-value">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="slider"
              />
            </div>
          )}

          <div className="panel-group">
            <div className="panel-heading-row">
              <h2 className="panel-heading">Stops</h2>
              <button className="ghost-button" onClick={addStop} disabled={stops.length >= 6}>
                add stop
              </button>
            </div>

            <div className="stop-list">
              {sortedStops.map((s) => (
                <div
                  key={s.id}
                  className={`stop-row${s.id === activeId ? ' is-active' : ''}`}
                  onClick={() => setActiveId(s.id)}
                >
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => updateStop(s.id, { color: e.target.value })}
                    className="swatch-input"
                    aria-label={`Color for stop at ${s.position}%`}
                  />
                  <input
                    type="text"
                    value={s.color}
                    onChange={(e) => updateStop(s.id, { color: e.target.value })}
                    className="hex-input"
                    spellCheck={false}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={s.position}
                    onChange={(e) => updateStop(s.id, { position: Number(e.target.value) })}
                    className="pos-input"
                  />
                  <button
                    className="remove-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeStop(s.id)
                    }}
                    disabled={stops.length <= 2}
                    aria-label="Remove stop"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-group">
            <h2 className="panel-heading">Starting points</h2>
            <div className="preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  className="preset-chip"
                  style={{ background: buildCss(p.type, p.angle, p.stops.map((s) => ({ ...s, id: 'p' }))) }}
                  onClick={() => applyPreset(p)}
                  title={p.name}
                >
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="output">
        <code className="output-code">{cssBlock}</code>
        <button className="copy-button" onClick={copyCss}>
          {copied ? 'copied' : 'copy'}
        </button>
      </footer>
    </div>
  )
}
