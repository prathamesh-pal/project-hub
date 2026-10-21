import { type ChangeEvent, useMemo, useRef, useState } from "react"
import { MdChangeCircle } from "react-icons/md"
import {
  BiCopyAlt,
  BiCheck,
  BiDownload,
  BiLink,
  BiChevronDown,
} from "react-icons/bi"

const DICEBEAR = "https://api.dicebear.com/9.x"
const PORTRAITS = "https://randomuser.me/api/portraits"

const STYLES = [
  { label: "Illustration", value: "illustration", kind: "dicebear", path: "avataaars" },
  { label: "Cartoon", value: "cartoon", kind: "dicebear", path: "adventurer" },
  { label: "Sketchy", value: "sketchy", kind: "dicebear", path: "croodles" },
  { label: "Robots", value: "robots", kind: "dicebear", path: "bottts" },
  { label: "Pixel art", value: "art", kind: "dicebear", path: "pixel-art" },
  { label: "Male photo", value: "male", kind: "portrait", path: "men" },
  { label: "Female photo", value: "female", kind: "portrait", path: "women" },
] as const

const HISTORY_LIMIT = 8

const randomSeed = (kind: "portrait" | "dicebear") =>
  kind === "portrait"
    ? String(Math.floor(Math.random() * 100)) // portraits exist for 0–99
    : Math.random().toString(36).slice(2, 10)

const buildUrl = (styleValue: string, seed: string) => {
  const style = STYLES.find((s) => s.value === styleValue) ?? STYLES[0]
  return style.kind === "portrait"
    ? `${PORTRAITS}/${style.path}/${seed}.jpg`
    : `${DICEBEAR}/${style.path}/svg?seed=${encodeURIComponent(seed)}`
}

export default function App() {
  const [option, setOption] = useState("sketchy")
  const [seed, setSeed] = useState(() => randomSeed("dicebear"))
  const [history, setHistory] = useState<{ option: string; seed: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const style = STYLES.find((s) => s.value === option)
  const isPortrait = style?.kind === "portrait"
  const src = useMemo(() => buildUrl(option, seed), [option, seed])

  const show = (nextOption: string, nextSeed: string) => {
  if (buildUrl(nextOption, nextSeed) !== src) {
    setLoading(true)
    setFailed(false)
  }
  setOption(nextOption)
  setSeed(nextSeed)
}

  const remember = () =>
    setHistory((prev) =>
      [{ option, seed }, ...prev.filter((h) => !(h.option === option && h.seed === seed))].slice(
        0,
        HISTORY_LIMIT
      )
    )

  const onOptionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    const nextStyle = STYLES.find((s) => s.value === next)
    if (nextStyle) show(next, randomSeed(nextStyle.kind))
  }

  const generate = () => {
    remember()
    show(option, randomSeed(style?.kind ?? "dicebear"))
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src)
      setCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt("Copy this link:", src)
    }
  }

  const download = async () => {
    setDownloading(true)
    try {
      // fetch → blob, because the `download` attribute is ignored on cross-origin URLs
      const res = await fetch(src)
      if (!res.ok) throw new Error("Request failed")
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = `avatar-${option}-${seed || "x"}.${isPortrait ? "jpg" : "svg"}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(src, "_blank", "noopener,noreferrer")
    } finally {
      setDownloading(false)
    }
  }

  const secondaryBtn =
    "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition hover:bg-white/10 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:opacity-60"

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06120e] flex items-center justify-center p-6 text-white">
      {/* background glows */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-emerald-600/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-teal-400/25 blur-3xl" />

      {/* card */}
      <main className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-10">
        {/* avatar */}
        <div className="flex justify-center">
          <div className="rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-300 p-1 shadow-xl shadow-emerald-500/30">
            <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-[#06120e] bg-emerald-100">
              {loading && !failed && (
                <div className="absolute inset-0 animate-pulse bg-emerald-200/70" />
              )}
              {failed ? (
                <div className="flex h-full w-full items-center justify-center bg-[#0b1f18] px-3 text-center text-xs text-slate-400">
                  Couldn’t load avatar. Try Change.
                </div>
              ) : (
                <img
                  key={src}
                  src={src}
                  alt="Generated avatar"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false)
                    setFailed(true)
                  }}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    loading ? "opacity-0" : "opacity-100"
                  }`}
                />
              )}
            </div>
          </div>
        </div>

        {/* heading */}
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Avatar Generator</h1>
          <p className="mt-2 text-sm text-slate-400">
            Generate unlimited avatars for your website
          </p>
        </div>

        {/* options */}
        <div className="mt-8 space-y-4">
          <div className="relative">
            <select
              aria-label="Avatar style"
              value={option}
              onChange={onOptionChange}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            >
              {STYLES.map((item) => (
                <option className="bg-slate-900" value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">
              <BiChevronDown />
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="shrink-0 text-lg text-emerald-300">
              <BiLink />
            </span>
            <span className="truncate text-sm text-slate-300" title={src}>
              {src}
            </span>
            <button
              type="button"
              aria-label="Copy link"
              onClick={copy}
              className="ml-auto shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              {copied ? (
                <span className="text-lg text-emerald-300">
                  <BiCheck />
                </span>
              ) : (
                <span className="text-lg">
                  <BiCopyAlt />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={generate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className="text-xl">
              <MdChangeCircle />
            </span>
            Change
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={download}
              disabled={downloading || failed}
              className={secondaryBtn}
            >
              <span className="text-lg">
                <BiDownload />
              </span>
              {downloading ? "Saving…" : "Download"}
            </button>
            <button type="button" onClick={copy} className={secondaryBtn}>
              {copied ? (
                <span className="text-lg text-emerald-300">
                  <BiCheck />
                </span>
              ) : (
                <span className="text-lg">
                  <BiCopyAlt />
                </span>
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        {/* history */}
        {history.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-sm text-slate-400">Recent</p>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <button
                  key={`${h.option}-${h.seed}`}
                  type="button"
                  onClick={() => show(h.option, h.seed)}
                  aria-label={`Restore ${h.option} avatar`}
                  className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-emerald-100 transition hover:scale-105 hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                >
                  <img
                    src={buildUrl(h.option, h.seed)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}