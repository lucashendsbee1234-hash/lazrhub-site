import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, Package, Upload } from "lucide-react";
import { api } from "../lib/api";
import AssetCard from "../components/AssetCard";
import EmptyState from "../components/EmptyState";

const SORTS = [
  { k: "new", label: "Newest" },
  { k: "downloads", label: "Downloads" },
  { k: "likes", label: "Likes" },
  { k: "trending", label: "Trending" },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [assets, setAssets] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "new";

  useEffect(() => { api.get("/categories").then((r) => setCats(r.data)); }, []);

  useEffect(() => {
    const load = () => api.get("/assets", { params: { q: q || undefined, category, sort, limit: 60 } }).then((r) => setAssets(r.data));
    const t = setTimeout(load, 250);
    const poll = setInterval(load, 8000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { clearTimeout(t); clearInterval(poll); window.removeEventListener("focus", onFocus); };
  }, [q, category, sort]);

  const setParam = (k, v) => {
    const p = new URLSearchParams(params);
    if (v && v !== "all") p.set(k, v); else p.delete(k);
    setParams(p);
  };

  const toggleFav = async (a) => {
    try {
      const { data } = await api.post(`/assets/${a.asset_id}/favorite`);
      setAssets((prev) => prev.map((x) => x.asset_id === a.asset_id ? { ...x, is_favorited: data.favorited, likes: x.likes + (data.favorited ? 1 : -1) } : x));
    } catch { window.location.href = "/login"; }
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-3">— Explore</div>
      <h1 className="font-heading text-4xl md:text-6xl font-black mb-8">Discover assets</h1>

      <div className="glass-strong rounded-2xl p-2 flex items-center gap-3 mb-6">
        <Search className="ml-3 text-[#00E5FF]" size={20} strokeWidth={1.5} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search anything…"
          className="flex-1 bg-transparent outline-none py-3 text-white placeholder-[#B8C2CC]/50" data-testid="explore-search-input" />
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setParam("category", "all")} className={category === "all" ? "px-4 py-2 rounded-full border border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] text-xs" : "px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[#B8C2CC] hover:text-white text-xs transition"}>All</button>
        {cats.map((c) => (
          <button key={c.slug} onClick={() => setParam("category", c.slug)}
            className={category === c.slug ? "px-4 py-2 rounded-full border border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] text-xs" : "px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[#B8C2CC] hover:text-white text-xs transition"}
            data-testid={`filter-${c.slug}`}
          >{c.name}</button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Filter size={14} className="text-[#B8C2CC]" strokeWidth={1.5} />
        <span className="text-xs uppercase tracking-widest text-[#B8C2CC]/70">Sort</span>
        {SORTS.map((s) => (
          <button key={s.k} onClick={() => setParam("sort", s.k)} className={sort === s.k ? "text-sm text-[#00E5FF]" : "text-sm text-[#B8C2CC] hover:text-white transition"}>
            {s.label}
          </button>
        ))}
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title={q ? "No assets found." : "Nothing has been uploaded yet."}
          subtitle={q ? "Try searching something different." : "Be the first creator to upload an asset!"}
          action={!q ? <Link to="/upload" className="btn-primary mt-4"><Upload size={14} /> Upload Your First Asset</Link> : null}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} onFavorite={toggleFav} />)}
        </div>
      )}
    </div>
  );
}
