import { useEffect, useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { api, resolveUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Collections() {
  const { user } = useAuth();
  const [cols, setCols] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", cover_image: "" });

  useEffect(() => { api.get("/collections").then((r) => setCols(r.data)); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = "/login"; return; }
    const { data } = await api.post("/collections", form);
    setCols([data, ...cols]);
    setShowCreate(false);
    setForm({ name: "", description: "", cover_image: "" });
    toast.success("Collection created");
  };

  const DEFAULTS = [
    { name: "Minimal Wallpapers", cover: "https://images.unsplash.com/photo-1687894986595-da703eb96375?w=800" },
    { name: "Cyberpunk Icons", cover: "https://images.unsplash.com/photo-1718561193320-3e8638a838da?w=800" },
    { name: "Best Fonts", cover: "https://images.unsplash.com/photo-1635614017406-7c192d832072?w=800" },
    { name: "Gaming UI", cover: "https://images.unsplash.com/photo-1766342088246-5328f16fe9d0?w=800" },
    { name: "Space Themes", cover: "https://images.unsplash.com/photo-1704426882813-8acfff020487?w=800" },
  ];

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-3">— Collections</div>
          <h1 className="font-heading text-4xl md:text-6xl font-black">Curated worlds</h1>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary" data-testid="collections-new">
          <Plus size={14} /> New
        </button>
      </div>

      {showCreate && (
        <form onSubmit={create} className="glass-strong rounded-2xl p-6 mb-8 grid md:grid-cols-3 gap-3">
          <input required placeholder="Collection name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-lazr" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-lazr" />
          <input placeholder="Cover image URL" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="input-lazr" />
          <button type="submit" className="btn-accent md:col-span-3">Create Collection</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...cols, ...DEFAULTS.map((d, i) => ({ collection_id: `d${i}`, name: d.name, cover_image: d.cover, asset_ids: [] }))].map((c, i) => (
          <div key={c.collection_id} className="card-lazr overflow-hidden group cursor-hover">
            <div className="aspect-[16/9] relative overflow-hidden">
              {c.cover_image ? (
                <img src={resolveUrl(c.cover_image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#00E5FF]/20 to-[#7C3AED]/30 flex items-center justify-center">
                  <FolderKanban size={40} strokeWidth={1} className="text-[#00E5FF]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] to-transparent opacity-60" />
            </div>
            <div className="p-5">
              <div className="font-heading font-semibold text-white">{c.name}</div>
              <div className="text-xs text-[#B8C2CC]/70 mt-1">{c.asset_ids?.length || 0} assets</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
