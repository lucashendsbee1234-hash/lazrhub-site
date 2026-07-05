import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Sparkles, ArrowRight, Upload as UploadIcon, Zap, Layers, Users } from "lucide-react";
import { api, fmtNum, resolveUrl } from "../lib/api";
import CategoryCard from "../components/CategoryCard";
import AssetCard from "../components/AssetCard";

const SUGGESTIONS = ["wallpaper", "icon", "template", "font", "3D model", "UI", "sound effect"];

export default function Home() {
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newUploads, setNewUploads] = useState([]);
  const [creators, setCreators] = useState([]);
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [phIdx, setPhIdx] = useState(0);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    (async () => {
      const [c, f, t, n, cr] = await Promise.all([
        api.get("/categories"),
        api.get("/assets", { params: { sort: "likes", limit: 8 } }),
        api.get("/assets", { params: { sort: "trending", limit: 12 } }),
        api.get("/assets", { params: { sort: "new", limit: 8 } }),
        api.get("/leaderboards/creators", { params: { limit: 4 } }),
      ]);
      setCats(c.data); setFeatured(f.data); setTrending(t.data); setNewUploads(n.data); setCreators(cr.data);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPhIdx((i) => (i + 1) % SUGGESTIONS.length), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      const { data } = await api.get("/assets", { params: { q, limit: 12 } });
      setSearchResults(data);
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/explore?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        <div className="orb w-[500px] h-[500px] top-10 -left-40 bg-[#00E5FF]/30 animate-pulse-slow" />
        <div className="orb w-[600px] h-[600px] -top-20 -right-40 bg-[#7C3AED]/30 animate-pulse-slow" />
        <div className="orb w-[400px] h-[400px] bottom-0 left-1/3 bg-[#009DFF]/25" />
        <div className="absolute inset-0 grid-bg" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-block relative mb-8"
          >
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF] shadow-[0_0_60px_rgba(0,229,255,0.6)] logo-spin" />
              <div className="absolute inset-3 rounded-full border border-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.4)]" style={{ animation: "logo-spin 8s linear infinite reverse" }} />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] shadow-[0_0_30px_rgba(0,229,255,0.7)] animate-pulse-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-white" strokeWidth={2} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[10px] tracking-[0.4em] uppercase text-[#00E5FF] font-heading mb-4">
            Digital Creator Hub · v1.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]"
          >
            <span className="block">Discover.</span>
            <span className="block gradient-text">Create.</span>
            <span className="block">Share.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 text-base md:text-lg text-[#B8C2CC] max-w-2xl mx-auto">
            A home for creators to upload and discover amazing digital assets. Wallpapers, UI kits, fonts, 3D models — reimagined for the future.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explore" className="btn-primary" data-testid="hero-explore-button">
              <Zap size={16} strokeWidth={2} /> Explore Assets
            </Link>
            <Link to="/upload" className="btn-secondary" data-testid="hero-upload-button">
              <UploadIcon size={16} strokeWidth={2} /> Upload
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
            {[{ n: "12K+", l: "Assets" }, { n: "3.2K", l: "Creators" }, { n: "1M+", l: "Downloads" }].map((s, i) => (
              <div key={i} className="glass rounded-xl py-3">
                <div className="font-heading font-black text-xl text-white">{s.n}</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#B8C2CC]/70">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* SEARCH */}
      <section className="relative py-16 px-6 md:px-12 max-w-5xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative glass-strong rounded-2xl p-2 flex items-center gap-3 border border-white/10 focus-within:border-[#00E5FF]/60 focus-within:shadow-[0_0_40px_rgba(0,229,255,0.15)] transition-all">
            <Search className="ml-3 text-[#00E5FF]" size={22} strokeWidth={1.5} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search for ${SUGGESTIONS[phIdx]}…`}
              className="flex-1 bg-transparent outline-none text-white text-lg placeholder-[#B8C2CC]/50 py-4"
              data-testid="search-input"
            />
            <button type="submit" className="btn-primary !py-2.5 !px-6 !text-xs" data-testid="search-submit">Search <ArrowRight size={14} /></button>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {SUGGESTIONS.map((s) => (
              <button type="button" key={s} onClick={() => setQ(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#B8C2CC] hover:text-white hover:border-[#009DFF]/50 hover:bg-[#009DFF]/10 transition"
                data-testid={`search-chip-${s}`}
              >{s}</button>
            ))}
          </div>
        </form>
        {searchResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 glass-strong rounded-2xl p-4">
            <div className="text-xs tracking-[0.2em] uppercase text-[#00E5FF] font-heading mb-3">{searchResults.length} live results</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {searchResults.slice(0, 8).map((a) => (
                <Link to={`/asset/${a.asset_id}`} key={a.asset_id} className="group flex gap-3 items-center p-2 rounded-lg hover:bg-white/5 transition">
                  <img src={resolveUrl(a.preview_url)} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{a.title}</div>
                    <div className="text-[10px] text-[#B8C2CC]/60 uppercase">{a.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-2">— Categories</div>
            <h2 className="font-heading text-3xl md:text-5xl font-black">Explore by category</h2>
          </div>
          <Link to="/explore" className="text-sm text-[#B8C2CC] hover:text-white flex items-center gap-1">All <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cats.map((c, i) => <CategoryCard key={c.slug} cat={c} index={i} />)}
        </div>
      </section>

      {/* FEATURED */}
      <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-2">— Featured</div>
          <h2 className="font-heading text-3xl md:text-5xl font-black">Curated for you</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
        </div>
      </section>

      {/* TRENDING carousel */}
      <section className="relative py-24">
        <div className="px-6 md:px-12 max-w-7xl mx-auto mb-10">
          <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-2">— Trending Now</div>
          <h2 className="font-heading text-3xl md:text-5xl font-black">The pulse of creators</h2>
        </div>
        <div className="marquee-pause overflow-hidden">
          <div className="marquee flex gap-6 w-max px-6">
            {[...trending, ...trending].map((a, i) => (
              <Link to={`/asset/${a.asset_id}`} key={i} className="relative w-72 shrink-0 card-lazr overflow-hidden cursor-hover">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={resolveUrl(a.preview_url)} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="p-4">
                  <div className="font-heading text-sm font-semibold truncate">{a.title}</div>
                  <div className="text-xs text-[#B8C2CC]/70 mt-1">{fmtNum(a.downloads)} downloads</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW UPLOADS */}
      <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-2">— Fresh</div>
            <h2 className="font-heading text-3xl md:text-5xl font-black">New uploads</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newUploads.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
        </div>
      </section>

      {/* CREATORS */}
      <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-2">— Top Creators</div>
          <h2 className="font-heading text-3xl md:text-5xl font-black">Meet the builders</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((cr, i) => (
            <motion.div key={cr.user_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={`/creator/${cr.username}`} className="card-lazr p-6 flex flex-col items-center text-center block h-full">
                <div className="relative">
                  <img src={resolveUrl(cr.avatar)} className="w-20 h-20 rounded-full object-cover ring-2 ring-[#00E5FF]/40" alt="" />
                  {cr.verified && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00E5FF] rounded-full flex items-center justify-center text-[#050510] text-xs font-bold">✓</div>}
                </div>
                <div className="font-heading font-semibold mt-4">{cr.name}</div>
                <div className="text-xs text-[#B8C2CC]/70">@{cr.username}</div>
                <div className="flex gap-4 mt-4 text-xs text-[#B8C2CC]">
                  <span><b className="text-white">{fmtNum(cr.uploads || 0)}</b> uploads</span>
                  <span><b className="text-white">{fmtNum(cr.total_downloads || 0)}</b> DL</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
