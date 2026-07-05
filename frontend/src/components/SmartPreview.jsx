import { Image, Video, Music, FileText, Code2, Archive, Box, Palette, Type, File as FileIcon, Play } from "lucide-react";
import { useState } from "react";
import { resolveUrl } from "../lib/api";

export const FILE_TYPE_META = {
  image: { label: "Image", color: "#00E5FF", Icon: Image },
  video: { label: "Video", color: "#EC4899", Icon: Video },
  audio: { label: "Audio", color: "#F59E0B", Icon: Music },
  font: { label: "Font", color: "#A78BFA", Icon: Type },
  archive: { label: "Archive", color: "#FBBF24", Icon: Archive },
  document: { label: "Document", color: "#60A5FA", Icon: FileText },
  code: { label: "Code", color: "#34D399", Icon: Code2 },
  "3d": { label: "3D Model", color: "#F472B6", Icon: Box },
  design: { label: "Design", color: "#C084FC", Icon: Palette },
  other: { label: "File", color: "#94A3B8", Icon: FileIcon },
};

export function getFileMeta(fileType) {
  return FILE_TYPE_META[fileType] || FILE_TYPE_META.other;
}

/**
 * SmartPreview: renders the correct preview based on asset.file_type
 * Props:
 *  - asset: { preview_url, file_url, file_type, file_ext, mime_type, title }
 *  - variant: "card" | "hero" | "inline"
 */
export default function SmartPreview({ asset, variant = "card" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { preview_url, file_url, file_type = "other", title, mime_type } = asset || {};
  const meta = getFileMeta(file_type);
  const { Icon, color, label } = meta;

  // Always prefer a custom preview_url image if present and not failed
  if (preview_url && !imgFailed) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${variant === "card" ? "" : "rounded-xl"}`}>
        <img
          src={resolveUrl(preview_url)}
          alt={title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
        <TypeBadge Icon={Icon} label={label} color={color} />
      </div>
    );
  }

  // Video: show <video> tag
  if (file_type === "video" && file_url) {
    return (
      <div className="relative w-full h-full bg-[#080813] overflow-hidden">
        <video
          src={resolveUrl(file_url)}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            try { e.target.currentTime = 0.5; } catch (_err) { /* ignore */ }
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play size={20} fill="#050510" strokeWidth={0} className="text-[#050510] ml-1" />
          </div>
        </div>
        <TypeBadge Icon={Icon} label={label} color={color} />
      </div>
    );
  }

  // Audio inline card
  if (file_type === "audio") {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F59E0B]/10 via-[#080813] to-[#F59E0B]/5 overflow-hidden p-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center">
          <Music size={26} strokeWidth={1.5} className="text-[#F59E0B]" />
        </div>
        <AudioWave />
        <TypeBadge Icon={Icon} label={label} color={color} />
      </div>
    );
  }

  // Font preview: shows sample text (visual placeholder, font loading requires @font-face)
  if (file_type === "font") {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#A78BFA]/10 via-[#080813] to-[#A78BFA]/5 p-6">
        <div className="font-heading text-3xl md:text-4xl font-black text-white leading-none">Aa Bb</div>
        <div className="text-xs text-[#B8C2CC]/70 tracking-widest uppercase">Font Preview</div>
        <TypeBadge Icon={Icon} label={label} color={color} />
      </div>
    );
  }

  // Fallback: category icon with gradient
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 overflow-hidden"
         style={{ background: `linear-gradient(135deg, ${color}18, #080813 60%, ${color}10)` }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center border"
           style={{ background: `${color}12`, borderColor: `${color}55` }}>
        <Icon size={32} strokeWidth={1.3} style={{ color }} />
      </div>
      <div className="text-xs text-[#B8C2CC]/80 tracking-widest uppercase font-heading">{label}</div>
      <TypeBadge Icon={Icon} label={label} color={color} />
    </div>
  );
}

function TypeBadge({ Icon, label, color }) {
  return (
    <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium backdrop-blur-md"
         style={{ background: "rgba(8,8,19,0.7)", border: `1px solid ${color}55`, color }}>
      <Icon size={10} strokeWidth={2} /> {label}
    </div>
  );
}

function AudioWave() {
  return (
    <div className="flex items-end gap-1 h-8">
      {[0.4, 0.7, 0.9, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5].map((h, i) => (
        <div key={i}
          className="w-1 rounded-full bg-[#F59E0B]/70"
          style={{
            height: `${h * 100}%`,
            animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes wave { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }`}</style>
    </div>
  );
}
