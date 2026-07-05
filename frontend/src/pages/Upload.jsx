import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, X, Check, Image as ImageIcon, File as FileIcon } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import SmartPreview, { getFileMeta } from "../components/SmartPreview";

const CATS = [
  "wallpapers", "icons", "ui-kits", "mobile-ui", "desktop-setups",
  "fonts", "templates", "sound-effects", "game-assets", "3d-models", "animations"
];
const LICENSES = ["Free", "Pro", "MIT", "Creative Commons"];

export default function Upload() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [mainFile, setMainFile] = useState(null); // The actual asset file (any type)
  const [mainMeta, setMainMeta] = useState(null); // Detected metadata after upload
  const [previewFile, setPreviewFile] = useState(null); // Optional custom preview image
  const [previewLocalUrl, setPreviewLocalUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "wallpapers",
    tags: "", license: "Free", version: "1.0.0"
  });
  const mainInputRef = useRef(null);
  const previewInputRef = useRef(null);

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

  const detectLocalType = (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    const IMAGE = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".avif"];
    const VIDEO = [".mp4", ".mov", ".webm", ".avi", ".mkv"];
    const AUDIO = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];
    const FONT = [".ttf", ".otf", ".woff", ".woff2"];
    const ARCHIVE = [".zip", ".rar", ".7z", ".tar", ".gz"];
    const DOC = [".pdf", ".docx", ".txt", ".md"];
    const CODE = [".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".py", ".java", ".cpp", ".cs"];
    const THREE = [".obj", ".fbx", ".glb", ".gltf", ".stl", ".blend"];
    if (IMAGE.includes(ext)) return "image";
    if (VIDEO.includes(ext)) return "video";
    if (AUDIO.includes(ext)) return "audio";
    if (FONT.includes(ext)) return "font";
    if (ARCHIVE.includes(ext)) return "archive";
    if (DOC.includes(ext)) return "document";
    if (CODE.includes(ext)) return "code";
    if (THREE.includes(ext)) return "3d";
    return "other";
  };

  const handleMainFile = (file) => {
    if (!file) return;
    setMainFile(file);
    const detectedType = detectLocalType(file);
    const ext = "." + file.name.split(".").pop().toLowerCase();
    setMainMeta({ file_type: detectedType, file_ext: ext, original_filename: file.name, mime_type: file.type });
    // Auto-populate title from filename
    if (!form.title) setForm((f) => ({ ...f, title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") }));
  };

  const handlePreviewFile = (file) => {
    if (!file) return;
    setPreviewFile(file);
    setPreviewLocalUrl(URL.createObjectURL(file));
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainFile) { toast.error("Please add a file to upload"); return; }
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setUploading(true);
    try {
      const mainUp = await uploadFile(mainFile);
      let previewUrl = "";
      // If custom preview supplied use that, else if the main file is an image use it as preview
      if (previewFile) {
        const p = await uploadFile(previewFile);
        previewUrl = p.url;
      } else if (mainUp.file_type === "image") {
        previewUrl = mainUp.url;
      }
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        license: form.license,
        version: form.version,
        preview_url: previewUrl,
        file_url: mainUp.url,
        file_size: mainUp.size,
        file_size_bytes: mainUp.size_bytes,
        original_filename: mainUp.original_filename,
        file_ext: mainUp.file_ext,
        mime_type: mainUp.mime_type,
        file_type: mainUp.file_type,
        gallery: previewUrl ? [previewUrl] : [],
      };
      const { data } = await api.post("/assets", payload);
      toast.success("Asset published ⚡");
      navigate(`/asset/${data.asset_id}`);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const mainDropAsset = mainFile && mainMeta ? {
    file_type: mainMeta.file_type,
    file_ext: mainMeta.file_ext,
    title: mainFile.name,
    preview_url: mainMeta.file_type === "image" ? URL.createObjectURL(mainFile) : "",
    file_url: mainMeta.file_type === "video" ? URL.createObjectURL(mainFile) : "",
  } : null;

  const previewMeta = getFileMeta(mainMeta?.file_type || "other");

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#00E5FF] font-medium mb-2">Upload</div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold">Publish an asset</h1>
        <p className="text-sm text-[#B8C2CC]/80 mt-2">Any file type — image, video, audio, font, archive, code, 3D model, and more.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-6">
        {/* LEFT: File Upload Zone */}
        <div className="lg:col-span-3 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#B8C2CC] mb-2 block">Your file <span className="text-red-400">*</span></label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleMainFile(e.dataTransfer.files[0]); }}
              onClick={() => !mainFile && mainInputRef.current?.click()}
              data-testid="upload-drag-drop-zone"
              className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition overflow-hidden relative ${
                dragOver ? "border-[#00E5FF] bg-[#00E5FF]/5" : "border-white/15 hover:border-[#00E5FF]/50 bg-white/[0.02]"
              } ${mainFile ? "" : "cursor-pointer"}`}
            >
              {mainDropAsset ? (
                <>
                  <SmartPreview asset={mainDropAsset} />
                  <button type="button" onClick={(ev) => { ev.stopPropagation(); setMainFile(null); setMainMeta(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500/80">
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs text-white">
                    <previewMeta.Icon size={12} style={{ color: previewMeta.color }} />
                    <span className="truncate max-w-[200px]">{mainFile.name}</span>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud size={44} strokeWidth={1.2} className="text-[#00E5FF] mb-3" />
                  <div className="font-heading text-base font-semibold">Drop your file or click to browse</div>
                  <div className="text-xs text-[#B8C2CC]/60 mt-1">Images · Videos · Audio · Fonts · 3D · Code · Archives · Docs</div>
                </>
              )}
            </div>
            <input ref={mainInputRef} type="file" hidden onChange={(e) => handleMainFile(e.target.files[0])} />
          </div>

          {/* Optional custom preview */}
          <div>
            <label className="text-xs font-medium text-[#B8C2CC] mb-2 block">
              Preview image <span className="text-[#B8C2CC]/50">(optional — recommended for non-image files)</span>
            </label>
            <div
              onClick={() => previewInputRef.current?.click()}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-4 py-3 cursor-pointer transition"
            >
              {previewLocalUrl ? (
                <>
                  <img src={previewLocalUrl} className="w-12 h-12 rounded object-cover" alt="" />
                  <div className="flex-1 text-sm">{previewFile?.name}</div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewFile(null); setPreviewLocalUrl(""); }}><X size={14} /></button>
                </>
              ) : (
                <>
                  <ImageIcon size={18} className="text-[#00E5FF]" strokeWidth={1.5} />
                  <div className="text-sm text-[#B8C2CC]">Upload a custom preview image</div>
                </>
              )}
            </div>
            <input ref={previewInputRef} type="file" accept="image/*" hidden onChange={(e) => handlePreviewFile(e.target.files[0])} />
          </div>
        </div>

        {/* RIGHT: Metadata */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#B8C2CC] mb-2 block">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF]/60"
              placeholder="Give your asset a name" data-testid="upload-title" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#B8C2CC] mb-2 block">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF]/60 resize-none"
              placeholder="What makes this asset special?" data-testid="upload-description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#B8C2CC] mb-2 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF]/60"
                data-testid="upload-category">
                {CATS.map((c) => <option key={c} value={c} className="bg-[#101827]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#B8C2CC] mb-2 block">License</label>
              <select value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF]/60"
                data-testid="upload-license">
                {LICENSES.map((l) => <option key={l} value={l} className="bg-[#101827]">{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#B8C2CC] mb-2 block">Tags</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF]/60"
              placeholder="neon, cyberpunk, 4k (comma separated)" data-testid="upload-tags" />
          </div>
          {mainMeta && (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#B8C2CC]">
                <previewMeta.Icon size={13} style={{ color: previewMeta.color }} />
                <span className="text-white">{previewMeta.label}</span>
                <span className="text-[#B8C2CC]/50">·</span>
                <span className="text-[#B8C2CC]/70">{mainMeta.file_ext}</span>
                <span className="text-[#B8C2CC]/50">·</span>
                <span className="text-[#B8C2CC]/70">{(mainFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="text-[#B8C2CC]/60 truncate flex items-center gap-2">
                <FileIcon size={11} /> {mainMeta.original_filename}
              </div>
            </div>
          )}
          <button disabled={uploading || !mainFile} type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00E5FF] text-[#050510] text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="upload-publish">
            {uploading ? "Publishing…" : (<><Check size={15} strokeWidth={2.5} /> Publish asset</>)}
          </button>
        </div>
      </form>
    </div>
  );
}
