import { useEffect, useState } from "react";
import axios from "axios";

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ *
 * Put your key in a `.env` file (never commit it):
 *   VITE_PEXELS_API_KEY=your_key_here
 * Note: any key used in frontend code is still visible in the browser.
 * For a public app, proxy requests through a small backend instead.
 */
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY as string;
const API_URL = "https://api.pexels.com/v1/search";
const PER_PAGE = 12;
const DEFAULT_QUERY = "animals";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */
type Photo = {
  id: number;
  src: { medium: string; original: string };
  alt: string;
  photographer: string;
};

interface PexelsResponse {
  photos: Photo[];
  total_results: number;
  page: number;
  next_page?: string;
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) return "The API key is missing or invalid.";
    if (err.response?.status === 429)
      return "Too many requests. Wait a moment, then try again.";
    if (!err.response) return "Can't reach Pexels. Check your connection.";
  }
  return "Couldn't load images. Please try again.";
}

/* Downloads the image as a file. Falls back to opening it in a new tab. */
async function downloadPhoto(photo: Photo) {
  try {
    const res = await fetch(photo.src.original);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pexels-${photo.id}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(photo.src.original, "_blank", "noopener,noreferrer");
  }
}

/* ------------------------------------------------------------------ *
 * Small components
 * ------------------------------------------------------------------ */
function SearchBar({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex w-full max-w-xl"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search photos, e.g. mountains"
        aria-label="Search photos"
        className="min-w-0 flex-1 rounded-l-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-r-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Search
      </button>
    </form>
  );
}

function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-hidden bg-gray-100">
        <img
          src={photo.src.medium}
          alt={photo.alt || `Photo by ${photo.photographer}`}
          loading="lazy"
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">Photo by</p>
          <h2 className="truncate text-sm font-semibold text-gray-800">
            {photo.photographer}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => downloadPhoto(photo)}
          aria-label={`Download photo by ${photo.photographer}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7 10 5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
          Download
        </button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white"
      aria-hidden="true"
    >
      <div className="h-64 bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */
export default function App() {
  // Results
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Request state (loading starts true so we never flash "No images found")
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // What is being searched (query + page drive the fetch)
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0); // bump to re-run the fetch

  // What the user is typing (separate so typing doesn't trigger searches)
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY);

  /* Fetch photos whenever the query, page, or retry counter changes. */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPhotos() {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get<PexelsResponse>(API_URL, {
          params: { query, page, per_page: PER_PAGE },
          headers: { Authorization: API_KEY },
          signal: controller.signal,
        });

        // Page 1 replaces the list; later pages are appended.
        setPhotos((prev) => (page === 1 ? data.photos : [...prev, ...data.photos]));
        setTotalResults(data.total_results);
        setHasMore(Boolean(data.next_page));
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) return; // a newer request replaced this one
        console.error(err);
        setError(getErrorMessage(err));
        setLoading(false);
      }
    }

    fetchPhotos();
    return () => controller.abort();
  }, [query, page, retryCount]);

  /* Start a new search. */
  const handleSearch = () => {
    const q = searchInput.trim();
    if (!q || loading) return;

    if (q === query) {
      // Same term: re-run it from the start instead of doing nothing.
      setPage(1);
      setRetryCount((n) => n + 1);
    } else {
      setPhotos([]);
      setHasMore(false);
      setPage(1);
      setQuery(q);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1);
  };

  const handleRetry = () => setRetryCount((n) => n + 1);

  const isFirstLoad = loading && photos.length === 0;
  const isEmpty = !loading && !error && photos.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-12 text-gray-900 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-indigo-600 sm:text-5xl">
            Image Gallery
          </h1>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            Search free photos from photographers around the world.
          </p>
        </header>

        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          disabled={loading}
        />

        {/* Result summary */}
        {photos.length > 0 && (
          <p className="-mt-4 text-sm text-gray-500" aria-live="polite">
            Showing {photos.length} of {totalResults.toLocaleString()} photos for “{query}”
          </p>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}

          {isFirstLoad &&
            Array.from({ length: PER_PAGE }, (_, i) => <SkeletonCard key={i} />)}
        </div>

        {/* Empty state */}
        {isEmpty && (
          <p className="text-center text-gray-500">
            No photos found for “{query}”. Try a different word.
          </p>
        )}

        {/* Pagination */}
        {photos.length > 0 && hasMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-10 py-4 font-bold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        )}

        {photos.length > 0 && !hasMore && !loading && (
          <p className="text-sm text-gray-500">You've seen every result.</p>
        )}

        <footer className="pt-4 text-center text-xs text-gray-400">
          Photos provided by{" "}
          <a
            href="https://www.pexels.com/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline hover:text-indigo-600"
          >
            Pexels
          </a>
        </footer>
      </div>
    </div>
  );
}