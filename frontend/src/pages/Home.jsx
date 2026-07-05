import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Upload as UploadIcon, Sparkles, Image, Video, Music, Type, Archive, Code2, Box, FileText, Palette, TrendingUp, Clock, Award, FolderOpen, Users } from "lucide-react";
import { api, fmtNum, resolveUrl } from "../lib/api";
import AssetCard from "../components/AssetCard";
import EmptyState from "../components/EmptyState";
import SmartPreview from "../components/SmartPreview";

const POLL_MS = 10000;

// File type quick-filter chips
const FILE_TYPE_CHIPS = [
  { key: "all", label: "All", Icon: Sparkles },
  { key: "image", label: "Images", Icon: Image, color: "#00E5FF" },
  { key: "video", label: "Video", Icon: Video, color: "#EC4899" },
  { key: "audio", label: "Audio", Icon: Music, color: "#F59E0B" },
  { key: "font", label: "Fonts", Icon: Type, color: "#A78BFA" },
  { key: "3d", label: "3D", Icon: Box, color: "#F472B6" },
  { key: "code", label: "Code", Icon: Code2, color: "#34D399" },
  { key: "document", label: "Docs", Icon: FileText, color: "#60A5FA" },
  { key: "archive", label: "Archives", Icon: Archive, color: "#FBBF24" },
  { key: "design", label: "Design", Icon: Palette, color: "#C084FC" },
];

const CATEGORY_ICONS = { wallpapers: Image, icons: Sparkles, "ui-kits": Palette, "mobile-ui": Palette, "desktop-setups": Image, fonts: Type, templates: FileText, "sound-effects": Music, "game-assets": Box, "3d-models": Box, animations: Video };

export default function Home() {
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [creators, setCreators] = useState([]);
  const [collections, setCollections] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState({ assets: 0, creators: 0, downloads: 0 });

  const load = async () => {
    try {
      const [c, f, n, cr, col] = await Promise.all([
        api.get("/categories"),
        api.get("/assets", { params: { sort: "trending", limit: 8, file_type: typeFilter !== "all" ? typeFilter : undefined } }),
        api.get("/assets", { params: { sort: "new", limit: 12, file_type: typeFilter !== "all" ? typeFilter : undefined } }),
        api.get("/leaderboards/creators", { params: { limit: 4 } }),
        api.get("/collections"),
      ]);
      setCats(c.data); setFeatured(f.data); setRecent(n.data); setCreators(cr.data); setCollections(col.data.slice(0, 4));
      const totalAssets = c.data.reduce((s, x) => s + (x.count || 0), 0);
      const totalDl = cr.data.reduce((s, x) => s + (x.total_downloads || 0), 0);
      setStats({ assets: totalAssets, creators: cr.data.length, downloads: totalDl });
    } catch (e) { /* noop */ }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, [typeFilter]);

  const heroAsset = featured[0];

  return (
    <div className="pt-16">
      {/* ===================== FEATURED BANNER (compact 60vh) ===================== */}
      <section className="relative border-b border-white/[0.06] bg-gradient-to-b from-[#080813] to-[#050510] overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center min-h-[calc(60vh)]">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-white/10 bg-white/[0.04] text-[#B8C2CC] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              {fmtNum(stats.assets)} assets · {fmtNum(stats.creators)} creators · {fmtNum(stats.downloads)} downloads
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
              The creator hub for<br />
              <span className="gradient-text">every digital file.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-5 text-base text-[#B8C2CC] max-w-xl">
              Upload, discover and share wallpapers, fonts, code, 3D models, audio, video — <span className="text-white">any file type</span>. Built for creators of the future.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3">
              <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00E5FF] text-[#050510] text-sm font-semibold hover:brightness-110 transition" data-testid="hero-explore-button">
                Explore <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link to="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium border border-white/10 transition" data-testid="hero-upload-button">
                <UploadIcon size={14} strokeWidth={2} /> Upload
              </Link>
            </motion.div>
          </div>

          {/* Right side: featured asset showcase */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative">
            {heroAsset ? (
              <Link to={`/asset/${heroAsset.asset_id}`}>
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#080813] border border-white/10 shadow-2xl hover:border-[#00E5FF]/30 transition group">
                  <SmartPreview asset={heroAsset} variant="hero" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/95 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-[10px] uppercase tracking-widest text-[#00E5FF] mb-1 font-medium">Featured</div>
                    <div className="font-heading font-bold text-lg text-white">{heroAsset.title}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#B8C2CC]">
                      <img src={resolveUrl(heroAsset.creator?.avatar)} className="w-5 h-5 rounded-full" alt="" />
                      {heroAsset.creator?.name}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative rounded-2xl aspect-[4/3] border border-dashed border-white/10 bg-[#080813] flex flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <UploadIcon size={22} className="text-[#00E5FF]" strokeWidth={1.5} />
                </div>
                <div className="font-heading font-semibold">Your asset could be here</div>
                <div className="text-sm text-[#B8C2CC]/70 max-w-xs">Upload something. Be the first featured creator.</div>
                <Link to="/upload" className="mt-2 text-sm text-[#00E5FF] hover:underline">Upload now →</Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ===================== FILE TYPE QUICK FILTERS ===================== */}
      <section className="border-b border-white/[0.06] bg-[#050510] sticky top-14 md:top-14 z-30 backdrop-blur-xl bg-[#050510]/95">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILE_TYPE_CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => setTypeFilter(c.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                typeFilter === c.key
                  ? "bg-white text-[#050510]"
                  : "bg-white/[0.04] text-[#B8C2CC] hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
              }`}
              data-testid={`type-filter-${c.key}`}
            >
              <c.Icon size={12} strokeWidth={2} style={typeFilter !== c.key && c.color ? { color: c.color } : {}} />
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="border-b border-white/[0.06] py-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold">Categories</h2>
            <Link to="/explore" className="text-xs text-[#B8C2CC] hover:text-white flex items-center gap-1">View all <ArrowRight size={11} /></Link>
          </div>
          <div className="flex gap-2 flex-wrap">
            {cats.map((c) => {
              const Icon = CATEGORY_ICONS[c.slug] || Sparkles;
              return (
                <Link
                  key={c.slug}
                  to={`/explore?category=${c.slug}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#00E5FF]/40 transition group"
                  data-testid={`category-${c.slug}`}
                >
                  <Icon size={13} strokeWidth={1.8} className="text-[#00E5FF]" />
                  <span className="text-sm text-white">{c.name}</span>
                  <span className="text-[10px] text-[#B8C2CC]/50 group-hover:text-[#B8C2CC]">{c.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== TRENDING ASSETS ===================== */}
      <section className="py-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#00E5FF] font-medium mb-1"><TrendingUp size={11} /> Trending</div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">Popular right now</h2>
            </div>
            <Link to="/explore?sort=trending" className="text-sm text-[#B8C2CC] hover:text-white flex items-center gap-1">See all <ArrowRight size={12} /></Link>
          </div>
          {featured.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No uploads yet."
              subtitle="Be the first creator to share something."
              action={<Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00E5FF] text-[#050510] text-sm font-semibold mt-4"><UploadIcon size={14} /> Upload first asset</Link>}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ===================== RECENT UPLOADS ===================== */}
      {recent.length > 0 && (
        <section className="py-10 border-t border-white/[0.06]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#00E5FF] font-medium mb-1"><Clock size={11} /> Fresh</div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold">Recently uploaded</h2>
              </div>
              <Link to="/explore?sort=new" className="text-sm text-[#B8C2CC] hover:text-white flex items-center gap-1">See all <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recent.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===================== TOP CREATORS ===================== */}
      <section className="py-10 border-t border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#00E5FF] font-medium mb-1"><Award size={11} /> Creators</div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">Top creators</h2>
            </div>
            <Link to="/leaderboards" className="text-sm text-[#B8C2CC] hover:text-white flex items-center gap-1">Leaderboard <ArrowRight size={12} /></Link>
          </div>
          {creators.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No creators yet."
              subtitle="Be the first to join LazR Hub."
              action={<Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00E5FF] text-[#050510] text-sm font-semibold mt-4"><Sparkles size={14} /> Create your account</Link>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creators.map((cr) => (
                <Link key={cr.user_id} to={`/creator/${cr.username}`} className="group relative p-5 rounded-xl bg-[#0D111C] border border-white/[0.06] hover:border-white/15 transition flex items-center gap-3">
                  <img src={resolveUrl(cr.avatar)} className="w-12 h-12 rounded-full ring-1 ring-white/10 group-hover:ring-[#00E5FF]/40 transition" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate flex items-center gap-1">
                      {cr.name} {cr.verified && <span className="text-[#00E5FF] text-xs">✦</span>}
                    </div>
                    <div className="text-xs text-[#B8C2CC]/70 truncate">@{cr.username}</div>
                    <div className="flex gap-3 mt-1.5 text-[10px] text-[#B8C2CC]/60">
                      <span>{fmtNum(cr.uploads || 0)} uploads</span>
                      <span>{fmtNum(cr.total_downloads || 0)} DL</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================== POPULAR COLLECTIONS ===================== */}
      {collections.length > 0 && (
        <section className="py-10 border-t border-white/[0.06]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#00E5FF] font-medium mb-1"><FolderOpen size={11} /> Curated</div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold">Popular collections</h2>
              </div>
              <Link to="/collections" className="text-sm text-[#B8C2CC] hover:text-white flex items-center gap-1">All collections <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {collections.map((c) => (
                <div key={c.collection_id} className="rounded-xl overflow-hidden bg-[#0D111C] border border-white/[0.06] hover:border-white/15 transition">
                  <div className="aspect-video bg-gradient-to-br from-[#00E5FF]/10 to-[#7C3AED]/10 flex items-center justify-center">
                    {c.cover_image ? <img src={resolveUrl(c.cover_image)} className="w-full h-full object-cover" alt="" loading="lazy" /> : <FolderOpen size={32} className="text-[#00E5FF]" />}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="text-xs text-[#B8C2CC]/60">{c.asset_ids?.length || 0} assets</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
