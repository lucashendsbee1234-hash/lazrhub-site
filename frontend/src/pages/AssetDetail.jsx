import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Heart, Share2, Send, Package, Tag } from "lucide-react";
import { api, fmtNum, resolveUrl } from "../lib/api";
import AssetCard from "../components/AssetCard";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function AssetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [comment, setComment] = useState("");
  const [gallerySelected, setGallerySelected] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/assets/${id}`);
      setAsset(data);
      setGallerySelected(0);
      const [c, r] = await Promise.all([
        api.get(`/assets/${id}/comments`),
        api.get("/assets", { params: { category: data.category, limit: 4 } }),
      ]);
      setComments(c.data);
      setRelated(r.data.filter((a) => a.asset_id !== id));
    })();
  }, [id]);

  if (!asset) return <div className="pt-32 text-center text-[#B8C2CC]">Loading…</div>;

  const gallery = asset.gallery?.length ? asset.gallery : [asset.preview_url];

  const download = async () => {
    await api.post(`/assets/${id}/download`);
    setAsset({ ...asset, downloads: asset.downloads + 1 });
    if (asset.file_url) {
      window.open(resolveUrl(asset.file_url), "_blank");
    } else {
      toast.success("Download started ⚡ (demo)");
    }
  };

  const fav = async () => {
    if (!user) { toast.error("Log in to favorite"); return; }
    const { data } = await api.post(`/assets/${id}/favorite`);
    setAsset({ ...asset, is_favorited: data.favorited, likes: asset.likes + (data.favorited ? 1 : -1) });
  };

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Log in to comment"); return; }
    if (!comment.trim()) return;
    const { data } = await api.post(`/assets/${id}/comments`, { text: comment });
    setComments([data, ...comments]);
    setComment("");
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl overflow-hidden">
            <img src={resolveUrl(gallery[gallerySelected])} className="w-full aspect-video object-cover" alt="" />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setGallerySelected(i)} className={`w-20 h-16 rounded-lg overflow-hidden border ${i === gallerySelected ? "border-[#00E5FF]" : "border-white/10"}`}>
                  <img src={resolveUrl(g)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <h3 className="font-heading text-xl font-semibold mb-4">Description</h3>
            <p className="text-[#B8C2CC] leading-relaxed">{asset.description || "No description yet."}</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {asset.tags?.map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#B8C2CC]">#{t}</span>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mt-16">
            <h3 className="font-heading text-xl font-semibold mb-6">Comments ({comments.length})</h3>
            <form onSubmit={submitComment} className="flex gap-3 mb-6">
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts…" className="input-lazr" data-testid="comment-input" />
              <button type="submit" className="btn-primary !px-5" data-testid="comment-submit"><Send size={14} /></button>
            </form>
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.comment_id} className="glass rounded-xl p-4 flex gap-3">
                  <img src={resolveUrl(c.user?.avatar)} className="w-9 h-9 rounded-full" alt="" />
                  <div>
                    <div className="font-heading text-sm">{c.user?.name} <span className="text-[#B8C2CC]/60 text-xs">@{c.user?.username}</span></div>
                    <div className="text-sm text-[#B8C2CC] mt-1">{c.text}</div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-sm text-[#B8C2CC]/60 text-center py-6 glass rounded-xl">No comments yet. Start the conversation.</div>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-xs tracking-[0.2em] uppercase text-[#00E5FF] font-heading">{asset.category}</div>
            <h1 className="font-heading text-3xl font-black mt-2">{asset.title}</h1>
            <Link to={`/creator/${asset.creator?.username}`} className="flex items-center gap-3 mt-6">
              <img src={resolveUrl(asset.creator?.avatar)} className="w-10 h-10 rounded-full ring-2 ring-[#00E5FF]/30" alt="" />
              <div>
                <div className="text-sm font-heading">{asset.creator?.name} {asset.creator?.verified && <span className="text-[#00E5FF]">✦</span>}</div>
                <div className="text-xs text-[#B8C2CC]">@{asset.creator?.username}</div>
              </div>
            </Link>
            <div className="grid grid-cols-3 gap-2 mt-6 text-center">
              <div className="glass rounded-xl py-3">
                <div className="font-heading font-black text-white">{fmtNum(asset.downloads)}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/70">DL</div>
              </div>
              <div className="glass rounded-xl py-3">
                <div className="font-heading font-black text-white">{fmtNum(asset.likes)}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/70">Likes</div>
              </div>
              <div className="glass rounded-xl py-3">
                <div className="font-heading font-black text-white">{fmtNum(asset.views)}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/70">Views</div>
              </div>
            </div>

            <button onClick={download} className="btn-accent w-full mt-6" data-testid="asset-download-button">
              <Download size={16} strokeWidth={2} /> Download {asset.license === "Pro" ? "(Pro)" : "Free"}
            </button>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button onClick={fav} className={`btn-secondary ${asset.is_favorited ? "!border-[#00E5FF] !text-[#00E5FF]" : ""}`} data-testid="asset-favorite">
                <Heart size={14} fill={asset.is_favorited ? "currentColor" : "none"} /> {asset.is_favorited ? "Saved" : "Save"}
              </button>
              <button onClick={share} className="btn-secondary" data-testid="asset-share">
                <Share2 size={14} /> Share
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#B8C2CC]/70 flex items-center gap-2"><Tag size={13} strokeWidth={1.5} /> License</span><span>{asset.license}</span></div>
              <div className="flex justify-between"><span className="text-[#B8C2CC]/70 flex items-center gap-2"><Package size={13} strokeWidth={1.5} /> Size</span><span>{asset.file_size}</span></div>
              <div className="flex justify-between"><span className="text-[#B8C2CC]/70">Version</span><span>{asset.version}</span></div>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Related</h3>
            <div className="grid grid-cols-2 gap-4">
              {related.slice(0, 4).map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
