import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Heart, Share2, Send, Package, Tag, FileText, Calendar } from "lucide-react";
import { api, fmtNum, resolveUrl } from "../lib/api";
import AssetCard from "../components/AssetCard";
import SmartPreview, { getFileMeta } from "../components/SmartPreview";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function AssetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/assets/${id}`);
      setAsset(data);
      const [c, r] = await Promise.all([
        api.get(`/assets/${id}/comments`),
        api.get("/assets", { params: { category: data.category, limit: 4 } }),
      ]);
      setComments(c.data);
      setRelated(r.data.filter((a) => a.asset_id !== id));
    })();
  }, [id]);

  if (!asset) return <div className="pt-32 text-center text-[#B8C2CC]">Loading…</div>;

  const meta = getFileMeta(asset.file_type);

  const download = async () => {
    if (asset.file_url) {
      const url = resolveUrl(asset.file_url);
      // Trigger real download
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.original_filename || asset.title;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Track only after starting
      try {
        await api.post(`/assets/${id}/download`);
        setAsset({ ...asset, downloads: asset.downloads + 1 });
        toast.success("Download started");
      } catch (_err) {
        /* track only */
      }
    } else {
      toast.error("No file available for download");
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
    <div className="pt-20 pb-16 px-4 md:px-8 max-w-[1440px] mx-auto min-h-screen">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0D111C] aspect-video">
            <SmartPreview asset={asset} variant="hero" />
          </div>

          <div className="mt-8 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#B8C2CC] mb-2 font-medium">
                <meta.Icon size={11} style={{ color: meta.color }} />
                {meta.label} · {asset.category}
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">{asset.title}</h1>
            </div>
          </div>

          {asset.description && (
            <div className="mt-6">
              <h3 className="text-xs font-medium text-[#B8C2CC] uppercase tracking-widest mb-2">Description</h3>
              <p className="text-[#B8C2CC] leading-relaxed">{asset.description}</p>
            </div>
          )}

          {asset.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {asset.tags.map((t) => (
                <Link key={t} to={`/explore?q=${encodeURIComponent(t)}`} className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-[#B8C2CC]">#{t}</Link>
              ))}
            </div>
          )}

          {/* Comments */}
          <div className="mt-12">
            <h3 className="font-heading text-lg font-bold mb-4">Comments <span className="text-[#B8C2CC]/60 text-sm">({comments.length})</span></h3>
            <form onSubmit={submitComment} className="flex gap-2 mb-6">
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts…"
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF]/60"
                data-testid="comment-input" />
              <button type="submit" className="px-4 rounded-lg bg-[#00E5FF] text-[#050510] font-semibold text-sm" data-testid="comment-submit"><Send size={14} /></button>
            </form>
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.comment_id} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] flex gap-3">
                  <img src={resolveUrl(c.user?.avatar)} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-white">{c.user?.name}</span>
                      <span className="text-[#B8C2CC]/60 text-xs ml-2">@{c.user?.username}</span>
                    </div>
                    <div className="text-sm text-[#B8C2CC] mt-1">{c.text}</div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-sm text-[#B8C2CC]/60 text-center py-8 rounded-lg border border-white/[0.06] bg-white/[0.02]">No comments yet. Start the conversation.</div>}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-2 space-y-4">
          {/* Creator */}
          <Link to={`/creator/${asset.creator?.username}`} className="flex items-center gap-3 p-4 rounded-xl bg-[#0D111C] border border-white/[0.06] hover:border-white/15 transition">
            <img src={resolveUrl(asset.creator?.avatar)} className="w-12 h-12 rounded-full ring-1 ring-white/10" alt="" />
            <div>
              <div className="font-medium text-white flex items-center gap-1">{asset.creator?.name} {asset.creator?.verified && <span className="text-[#00E5FF] text-xs">✦</span>}</div>
              <div className="text-xs text-[#B8C2CC]">@{asset.creator?.username}</div>
            </div>
          </Link>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={download} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00E5FF] text-[#050510] text-sm font-semibold hover:brightness-110 transition" data-testid="asset-download-button">
              <Download size={15} strokeWidth={2.5} /> Download {asset.file_size && `· ${asset.file_size}`}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={fav} className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                asset.is_favorited ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40" : "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
              }`} data-testid="asset-favorite">
                <Heart size={13} fill={asset.is_favorited ? "currentColor" : "none"} /> {asset.is_favorited ? "Saved" : "Save"}
              </button>
              <button onClick={share} className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm font-medium border border-white/10 transition" data-testid="asset-share">
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-[#0D111C] border border-white/[0.06]">
            <Stat label="Downloads" value={fmtNum(asset.downloads)} />
            <Stat label="Likes" value={fmtNum(asset.likes)} />
            <Stat label="Views" value={fmtNum(asset.views)} />
          </div>

          {/* File info */}
          <div className="rounded-xl bg-[#0D111C] border border-white/[0.06] p-4 space-y-3 text-sm">
            <div className="text-xs font-medium text-[#B8C2CC] uppercase tracking-widest">File info</div>
            <Row Icon={meta.Icon} label="File type" value={meta.label} valueColor={meta.color} />
            {asset.file_ext && <Row Icon={FileText} label="Extension" value={asset.file_ext} />}
            {asset.file_size && <Row Icon={Package} label="Size" value={asset.file_size} />}
            {asset.original_filename && <Row Icon={FileText} label="Filename" value={asset.original_filename} small />}
            <Row Icon={Tag} label="License" value={asset.license} />
            <Row Icon={Calendar} label="Version" value={asset.version} />
          </div>

          {related.length > 0 && (
            <div>
              <h3 className="font-heading text-sm font-bold mb-3">Related</h3>
              <div className="grid grid-cols-2 gap-3">
                {related.slice(0, 4).map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-heading font-bold text-lg text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/60 mt-0.5">{label}</div>
    </div>
  );
}

function Row({ Icon, label, value, valueColor, small }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[#B8C2CC]/80"><Icon size={12} strokeWidth={1.5} /> {label}</span>
      <span className={small ? "truncate text-xs" : "text-white"} style={valueColor ? { color: valueColor } : {}}>{value}</span>
    </div>
  );
}
