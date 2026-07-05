import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Bell, Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import { api, resolveUrl } from "../lib/api";
import SmartPreview from "./SmartPreview";

const NAV_LINKS = [
  { to: "/explore", label: "Explore" },
  { to: "/collections", label: "Collections" },
  { to: "/leaderboards", label: "Leaderboard" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ assets: [], creators: [], categories: [] });
  const [focused, setFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setFocused(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setFocused(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults({ assets: [], creators: [], categories: [] }); return; }
    const t = setTimeout(async () => {
      const [assets, cats] = await Promise.all([
        api.get("/assets", { params: { q, limit: 5 } }),
        api.get("/categories"),
      ]);
      const catMatches = cats.data.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3);
      setResults({ assets: assets.data, creators: [], categories: catMatches });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/explore?q=${encodeURIComponent(q)}`); setFocused(false); }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.06]" : "bg-[#050510]/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className={`max-w-[1440px] mx-auto flex items-center gap-4 px-4 md:px-8 transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" data-testid="nav-logo">
          <img src="/lazr-logo.png" alt="LazR Hub" className={`transition-all duration-300 ${scrolled ? "w-7 h-7" : "w-8 h-8"} object-contain`} />
          <span className="font-heading font-black tracking-tight text-base hidden sm:inline">
            LazR<span className="text-[#00E5FF]">Hub</span>
          </span>
        </Link>

        {/* Center: nav links */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                location.pathname === l.to ? "text-white bg-white/[0.06]" : "text-[#B8C2CC] hover:text-white hover:bg-white/[0.04]"
              }`}
              data-testid={`nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Search — always visible */}
        <div ref={searchRef} className="flex-1 relative max-w-xl mx-auto hidden md:block">
          <form onSubmit={submitSearch}>
            <div className={`flex items-center gap-2 rounded-lg transition ${
              focused ? "bg-[#101827] ring-1 ring-[#00E5FF]/50" : "bg-white/[0.04] hover:bg-white/[0.06]"
            } px-3 py-2`}>
              <Search size={15} strokeWidth={1.8} className="text-[#B8C2CC]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                placeholder="Search assets, creators, categories…"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[#B8C2CC]/50"
                data-testid="nav-search-input"
              />
              <kbd className="hidden sm:inline text-[10px] text-[#B8C2CC]/50 border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </form>
          <AnimatePresence>
            {focused && q.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full mt-2 left-0 right-0 rounded-lg bg-[#0D111C] border border-white/10 shadow-2xl overflow-hidden"
              >
                {results.categories.length > 0 && (
                  <div className="p-2">
                    <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/50 px-2 py-1">Categories</div>
                    {results.categories.map((c) => (
                      <Link key={c.slug} to={`/explore?category=${c.slug}`} className="flex items-center px-2 py-1.5 rounded hover:bg-white/5 text-sm text-white">
                        <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full mr-2" />{c.name}
                      </Link>
                    ))}
                  </div>
                )}
                {results.assets.length > 0 ? (
                  <div className="p-2 border-t border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/50 px-2 py-1">Assets</div>
                    {results.assets.map((a) => (
                      <Link key={a.asset_id} to={`/asset/${a.asset_id}`} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/5">
                        <div className="w-10 h-10 rounded overflow-hidden bg-[#080813] shrink-0">
                          <SmartPreview asset={a} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-white truncate">{a.title}</div>
                          <div className="text-[11px] text-[#B8C2CC]/60">{a.category} · {a.creator?.username}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-[#B8C2CC]/60">
                    No results for &quot;<span className="text-white">{q}</span>&quot;
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {user ? (
            <>
              <Link to="/upload" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00E5FF] text-[#050510] text-sm font-semibold hover:brightness-110 transition" data-testid="nav-upload-btn">
                <Upload size={14} strokeWidth={2.5} /> <span className="hidden md:inline">Upload</span>
              </Link>
              <button className="w-9 h-9 rounded-md hover:bg-white/5 flex items-center justify-center text-[#B8C2CC] hover:text-white transition relative" title="Notifications">
                <Bell size={16} strokeWidth={1.8} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfile((s) => !s)}
                  className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 hover:ring-[#00E5FF]/50 transition"
                  data-testid="nav-profile"
                >
                  <img src={resolveUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                </button>
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-[#0D111C] border border-white/10 shadow-2xl overflow-hidden"
                      onMouseLeave={() => setShowProfile(false)}
                    >
                      <div className="p-3 border-b border-white/5">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-[#B8C2CC]/70">@{user.username}</div>
                      </div>
                      <div className="p-1">
                        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 text-sm" data-testid="nav-dashboard">
                          <LayoutDashboard size={14} strokeWidth={1.5} /> Dashboard
                        </Link>
                        <Link to={`/creator/${user.username}`} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 text-sm">
                          <User size={14} strokeWidth={1.5} /> Profile
                        </Link>
                        <button onClick={async () => { await logout(); navigate("/"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 text-sm text-left" data-testid="nav-logout">
                          <LogOut size={14} strokeWidth={1.5} /> Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline text-sm text-[#B8C2CC] hover:text-white transition px-2" data-testid="nav-login">Log in</Link>
              <Link to="/register" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00E5FF] text-[#050510] text-sm font-semibold hover:brightness-110 transition" data-testid="nav-signup">
                Sign up
              </Link>
            </>
          )}
          <button onClick={() => setMobileOpen((m) => !m)} className="lg:hidden w-9 h-9 rounded-md hover:bg-white/5 flex items-center justify-center text-[#B8C2CC]">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-white/5 bg-[#050510]"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="block px-3 py-2 rounded hover:bg-white/5 text-sm">{l.label}</Link>
              ))}
              <Link to="/upload" className="block px-3 py-2 rounded hover:bg-white/5 text-sm">Upload</Link>
              <form onSubmit={submitSearch} className="pt-2">
                <div className="flex items-center gap-2 bg-white/5 rounded-md px-3 py-2">
                  <Search size={14} className="text-[#B8C2CC]" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
