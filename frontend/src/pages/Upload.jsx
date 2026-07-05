import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Image as ImageIcon, X, Check } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const CATS = [
  "wallpapers", "icons", "ui-kits", "mobile-ui", "desktop-setups",
  "fonts", "templates", "sound-effects", "game-assets", "3d-models", "animations"
];
const LICENSES = ["Free", "Pro", "MIT", "Creative Commons"];

export default function Upload() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [assetFile, setAssetFile] = useState(null);
  const [assetFileMeta, setAssetFileMeta] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "wallpapers",
    tags: "", license: "Free", version: "1.0.0"
  });
  const previewInputRef = useRef(null);
  const assetInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const handlePreviewChange = (file) => {
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAssetChange = (file) => {
    if (!file) return;
    setAssetFile(file);
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!previewFile) { toast.error("Please add a preview image"); return; }
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setUploading(true);
    try {
      const previewUp = await uploadFile(previewFile);
      let fileUp = null;
      if (assetFile) fileUp = await uploadFile(assetFile);
      const { data } = await api.post("/assets", {
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        license: form.license,
        version: form.version,
        preview_url: previewUp.url,
        file_url: fileUp?.url || "",
        file_size: fileUp?.size || previewUp.size,
        gallery: [previewUp.url],
      });
      toast.success("Asset published! ⚡");
      navigate(`/asset/${data.asset_id}`);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto min-h-screen">
      <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-3">— Upload</div>
      <h1 className="font-heading text-4xl md:text-6xl font-black mb-8">Publish an asset</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* PREVIEW DROP */}
        <div>
          <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">Preview Image</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePreviewChange(e.dataTransfer.files[0]); }}
            onClick={() => previewInputRef.current?.click()}
            data-testid="upload-drag-drop-zone"
            className={`mt-3 aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${
              dragOver ? "border-[#00E5FF] bg-[#00E5FF]/5" : "border-white/15 hover:border-[#00E5FF]/60 hover:bg-white/[0.03]"
            }`}
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover rounded-2xl" alt="preview" />
            ) : (
              <>
                <ImageIcon size={40} strokeWidth={1} className="text-[#00E5FF] mb-3" />
                <div className="font-heading text-sm">Drop preview or click to browse</div>
                <div className="text-xs text-[#B8C2CC]/60 mt-1">PNG, JPG, WebP</div>
              </>
            )}
          </div>
          <input ref={previewInputRef} type="file" accept="image/*" hidden onChange={(e) => handlePreviewChange(e.target.files[0])} />

          <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading mt-8 block">Asset File (Optional)</label>
          <div
            onClick={() => assetInputRef.current?.click()}
            className="mt-3 glass rounded-xl px-4 py-4 flex items-center gap-3 cursor-pointer hover:border-[#00E5FF]/40 transition"
          >
            <UploadCloud size={20} strokeWidth={1.5} className="text-[#00E5FF]" />
            <div className="text-sm">
              {assetFile ? assetFile.name : "Upload ZIP, font, model, audio, template"}
            </div>
            {assetFile && <button type="button" onClick={(e) => { e.stopPropagation(); setAssetFile(null); }}><X size={14} /></button>}
          </div>
          <input ref={assetInputRef} type="file" hidden onChange={(e) => handleAssetChange(e.target.files[0])} />
        </div>

        {/* FIELDS */}
        <div className="space-y-4">
          <div>
            <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-lazr mt-2" placeholder="Neon Grid Wallpaper" data-testid="upload-title" />
          </div>
          <div>
            <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-lazr mt-2 resize-none" placeholder="What makes this asset special?" data-testid="upload-description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-lazr mt-2" data-testid="upload-category">
                {CATS.map((c) => <option key={c} value={c} className="bg-[#101827]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">License</label>
              <select value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} className="input-lazr mt-2" data-testid="upload-license">
                {LICENSES.map((l) => <option key={l} value={l} className="bg-[#101827]">{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs tracking-[0.2em] uppercase text-[#009DFF] font-heading">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-lazr mt-2" placeholder="neon, cyberpunk, 4k" data-testid="upload-tags" />
          </div>
          <button disabled={uploading} type="submit" className="btn-accent w-full mt-4" data-testid="upload-publish">
            {uploading ? "Publishing…" : (<><Check size={16} /> Publish</>)}
          </button>
        </div>
      </form>
    </div>
  );
}
