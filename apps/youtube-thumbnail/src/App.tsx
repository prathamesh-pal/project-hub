import { useState, type FormEvent } from "react";
import getYouTubeID from 'get-youtube-id'

export default function App() {
  const [url, seturl] = useState('')

  const [thumbnail, setThumbnail] = useState("");

  const fetchThumbnail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const videoId = getYouTubeID(url);

    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      setThumbnail(thumbnailUrl);
    } else {
      alert("Paste a valid URL");
    }
  };
  return (

    <main className="min-h-screen bg-[#09090b] text-white px-5 py-8 md:px-10">
      {/* Header */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl">
            ▶
          </div>
          <span className="font-bold text-xl tracking-tight">
            THUMB<span className="text-orange-500">.</span>
          </span>
        </div>
        <span className="text-xs text-zinc-500 tracking-widest uppercase">
          Free YouTube Tool
        </span>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center mt-28 md:mt-36">

        <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-4 py-2 rounded-full text-xs text-zinc-400 mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          SIMPLE. FAST. FREE.
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">
          Your thumbnails.
          <br />
          <span className="text-orange-500">One click away.</span>
        </h1>

        <p className="text-zinc-400 text-base md:text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Download YouTube thumbnails in their highest available
          resolution. No signups, no nonsense.
        </p>

        {/* URL Form */}
        <form onSubmit={fetchThumbnail} className="mt-12 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-[#151518] border border-white/10 focus-within:border-orange-500/50 transition-all shadow-2xl shadow-black/30">

            <div className="flex items-center flex-1 gap-3 px-4">
              <span className="text-zinc-500 text-lg">🔗</span>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => seturl(e.target.value)}
                placeholder="Paste your YouTube URL here..."
                className="w-full bg-transparent outline-none py-4 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-7 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              Get Thumbnail <span className="ml-2">→</span>
            </button>
          </div>

          <p className="text-xs text-zinc-600 mt-4">
            Supports YouTube videos, Shorts and standard URLs.
          </p>
        </form>
      </section>

      {/* Preview */}
      <section className="max-w-4xl mx-auto mt-20 md:mt-24 pb-20">

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
              Thumbnail Preview
            </p>
            <p className="text-sm text-zinc-600 mt-1">
              Your image will appear below
            </p>
          </div>

          <span className="text-xs border border-white/10 rounded-lg px-3 py-2 text-zinc-500">
            16:9
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">

          {thumbnail ? (
            <>
              <div className="p-3 md:p-5">
                <img
                  src={thumbnail}
                  alt="YouTube Thumbnail"
                  className="w-full aspect-video object-contain rounded-xl bg-black"
                />
              </div>

              <div className="border-t border-white/10 px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Thumbnail ready
                    </p>
                    <p className="text-xs text-zinc-500">
                      Maximum resolution requested
                    </p>
                  </div>
                </div>

                <a
                  href={thumbnail}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto text-center bg-white text-black font-semibold text-sm px-6 py-3 rounded-xl hover:bg-orange-500 transition-colors"
                >
                  ↓ Download Image
                </a>
              </div>
            </>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center text-center px-5">
              <div className="w-16 h-16 rounded-2xl border border-white/10 bg-[#1a1a1e] flex items-center justify-center text-3xl mb-5">
                ▧
              </div>
              <p className="text-zinc-300 font-medium">
                Nothing to preview yet
              </p>
              <p className="text-sm text-zinc-600 mt-2">
                Paste a YouTube link above to get started.
              </p>
            </div>
          )}

        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            ["01", "High Quality", "Get the highest available thumbnail."],
            ["02", "Instant Preview", "See your thumbnail before downloading."],
            ["03", "Completely Free", "No account or subscription required."]
          ].map(([number, title, description]) => (
            <div key={number} className="border border-white/10 bg-[#111113] rounded-xl p-5">
              <p className="text-orange-500 text-xs font-mono mb-5">{number}</p>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto border-t border-white/10 pt-6 pb-4 flex flex-col sm:flex-row justify-between gap-3 text-xs text-zinc-600">
        <p>© 2026 THUMB. Made for creators.</p>
        <p>BUILT WITH CURIOSITY. POWERED BY YOUTUBE.</p>
      </footer>

    </main>

  );
}
