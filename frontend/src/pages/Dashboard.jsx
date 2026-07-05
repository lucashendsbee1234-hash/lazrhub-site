import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Grid3x3, Heart, FolderKanban, Bell, Settings, LayoutGrid } from "lucide-react";
import { api, fmtNum } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import AssetCard from "../components/AssetCard";

const TABS = [
  { k: "uploads", label: "My Uploads", Icon: Grid3x3 },
  { k: "favorites", label: "Favorites", Icon: Heart },
  { k: "collections", label: "Collections", Icon: FolderKanban },
  { k: "settings", label: "Settings", Icon: Settings },
];

export default function Dashboard() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("uploads");
  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cols, setCols] = useState([]);
  const [form, setForm] = useState({ name: "", bio: "", twitter: "", instagram: "", website: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name || "", bio: user.bio || "", twitter: user.twitter || "", instagram: user.instagram || "", website: user.website || "" });
    api.get("/dashboard/stats").then((r) => setStats(r.data));
    api.get("/assets", { params: { creator_id: user.user_id, limit: 40 } }).then((r) => setUploads(r.data));
    api.get("/dashboard/favorites").then((r) => setFavorites(r.data));
    api.get("/collections", { params: { creator_id: user.user_id } }).then((r) => setCols(r.data));
  }, [user]);

  if (!user) return null;

  const saveProfile = async (e) => {
    e.preventDefault();
    await api.patch("/users/me", form);
    await refresh();
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <img src={user.avatar} className="w-16 h-16 rounded-full ring-2 ring-[#00E5FF]/40" alt="" />
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading">— Dashboard</div>
          <h1 className="font-heading text-3xl md:text-5xl font-black">Hey, {user.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
        {stats && [
          { l: "Uploads", n: stats.uploads },
          { l: "Downloads", n: stats.downloads },
          { l: "Likes", n: stats.likes },
          { l: "Views", n: stats.views },
          { l: "Favorites", n: stats.favorites },
          { l: "Followers", n: stats.followers },
        ].map((s) => (
          <div key={s.l} className="glass rounded-xl p-4">
            <div className="font-heading text-2xl font-black">{fmtNum(s.n)}</div>
            <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/70 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {TABS.map(({ k, label, Icon }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition ${
              tab === k ? "border border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF]" : "border border-white/10 bg-white/5 text-[#B8C2CC] hover:text-white"
            }`}
            data-testid={`dashboard-tab-${k}`}
          >
            <Icon size={12} strokeWidth={1.5} /> {label}
          </button>
        ))}
      </div>

      {tab === "uploads" && (
        <div>
          {uploads.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <LayoutGrid size={36} className="text-[#00E5FF] mx-auto mb-3" strokeWidth={1.5} />
              <div className="font-heading mb-2">No uploads yet</div>
              <Link to="/upload" className="btn-primary mt-4 inline-flex">Upload first asset</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {uploads.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
            </div>
          )}
        </div>
      )}

      {tab === "favorites" && (
        <div>
          {favorites.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-[#B8C2CC]">No favorites yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
            </div>
          )}
        </div>
      )}

      {tab === "collections" && (
        <div>
          {cols.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-[#B8C2CC]">
              No collections yet. <Link to="/collections" className="text-[#00E5FF] hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cols.map((c) => (
                <div key={c.collection_id} className="card-lazr p-6">
                  <div className="font-heading font-semibold">{c.name}</div>
                  <div className="text-xs text-[#B8C2CC] mt-1">{c.asset_ids?.length || 0} assets</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "settings" && (
        <form onSubmit={saveProfile} className="glass-strong rounded-2xl p-8 max-w-2xl space-y-4">
          <div>
            <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-lazr mt-2" data-testid="settings-name" />
          </div>
          <div>
            <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-lazr mt-2 resize-none" data-testid="settings-bio" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Twitter" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="input-lazr" />
            <input placeholder="Instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="input-lazr" />
            <input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-lazr" />
          </div>
          <button type="submit" className="btn-primary" data-testid="settings-save">Save changes</button>
        </form>
      )}
    </div>
  );
}
