import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Package, Upload, Sparkles, Image, Video, Music, Type, Archive, Code2, Box, FileText, Palette } from "lucide-react";
import { api } from "../lib/api";
import AssetCard from "../components/AssetCard";
import EmptyState from "../components/EmptyState";

const SORTS = [
  { k: "new", label: "Newest" },
  { k: "trending", label: "Trending" },
  { k: "downloads", label: "Most downloaded" },
  { k: "likes", label: "Most liked" },
];

const FILE_TYPES = [
  { key: "all", label: "All files", Icon: Sparkles },
  { key: "image", label: "Images", Icon: Image, color: "#00E5FF" },
  { key: "video", label: "Video", Icon: Video, color: "#EC4899" },
  { key: "audio", label: "Audio", Icon: Music, color: "#F59E0B" },
  { key: "font", label: "Fonts", Icon: Type, color: "#A78BFA" },
  { key: "3d", label: "3D", Icon: Box, color: "#F472B6" },
  { key: "code", label: "Code", Icon: Code2, color: "#34D399" },
  { key: "document", label: "Documents", Icon: FileText, color: "#60A5FA" },
  { key: "archive", label: "Archives", Icon: Archive, color: "#FBBF24" },
  { key: "design", label: "Design", Icon: Palette, color: "#C084FC" },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [assets, setAssets] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const category = params.get("category") || "all";
  const fileType = params.get("file_type") || "all";
  const sort = params.get("sort") || "new";

  useEffect(() => { api.get("/categories").then((r) => setCats(r.data)); }, []);

  useEffect(() => {
    const load = () => api.get("/assets", {
      params: {
        q: q || undefined,
        category,
        file_type: fileType !== "all" ? fileType : undefined,
        sort,
        limit: 60,
      },
    }).then((r) => setAssets(r.data));
    const t = setTimeout(load, 250);
    const poll = setInterval(load, 10000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { clearTimeout(t); clearInterval(poll); window.removeEventListener("focus", onFocus); };
  }, [q, category, fileType, sort]);

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
    <div className="pt-20 pb-16 min-h-screen">
      {/* Header */}
      <div className="border-b border-white/[0.06] py-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Explore</h1>
          <p className="text-sm text-[#B8C2CC] mt-1">Discover assets from creators around the world.</p>
        </div>
      </div>

      {/* Search + Sort bar */}
      <div className="border-b border-white/[0.06] sticky top-14 z-30 bg-[#050510]/95 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-md flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.06] rounded-lg px-3 py-2 transition">
            <Search size={14} strokeWidth={1.8} className="text-[#B8C2CC]" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search assets, tags, filenames…"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[#B8C2CC]/50"
              data-testid="explore-search-input" />
          </div>
          <div className="flex items-center gap-1 text-xs text-[#B8C2CC]">
            <span className="hidden sm:inline">Sort:</span>
            {SORTS.map((s) => (
              <button key={s.k} onClick={() => setParam("sort", s.k)}
                className={`px-2.5 py-1 rounded-md transition ${sort === s.k ? "bg-white/10 text-white" : "hover:text-white"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* File type chips */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILE_TYPES.map((c) => (
            <button
              key={c.key}
              onClick={() => setParam("file_type", c.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                fileType === c.key
                  ? "bg-white text-[#050510] border-white"
                  : "bg-white/[0.03] text-[#B8C2CC] hover:bg-white/[0.07] hover:text-white border-white/[0.08]"
              }`}
              data-testid={`filetype-${c.key}`}
            >
              <c.Icon size={11} strokeWidth={2} style={fileType !== c.key && c.color ? { color: c.color } : {}} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => setParam("category", "all")}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition ${category === "all" ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40" : "bg-white/[0.03] text-[#B8C2CC] hover:text-white border border-white/[0.06]"}`}>All categories</button>
          {cats.map((c) => (
            <button key={c.slug} onClick={() => setParam("category", c.slug)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition ${category === c.slug ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40" : "bg-white/[0.03] text-[#B8C2CC] hover:text-white border border-white/[0.06]"}`}
              data-testid={`filter-${c.slug}`}>
              {c.name}
              <span className="ml-1 text-[10px] text-[#B8C2CC]/50">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {assets.length === 0 ? (
          <EmptyState
            icon={Package}
            title={q ? "No assets found." : (category !== "all" || fileType !== "all") ? "Nothing in this category yet." : "No uploads yet."}
            subtitle={q ? "Try searching something different." : "Be the first creator to share something."}
            action={!q ? <Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00E5FF] text-[#050510] text-sm font-semibold mt-4"><Upload size={14} /> Upload asset</Link> : null}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {assets.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} onFavorite={toggleFav} />)}
          </div>
        )}
      </div>
    </div>
  );
}
