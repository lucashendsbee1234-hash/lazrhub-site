import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Heart, Eye } from "lucide-react";
import { fmtNum, resolveUrl } from "../lib/api";

export default function AssetCard({ asset, index = 0, onFavorite }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
      className="card-lazr group overflow-hidden cursor-hover"
      data-testid="asset-card"
    >
      <Link to={`/asset/${asset.asset_id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[1.25rem]">
          <img src={resolveUrl(asset.preview_url)} alt={asset.title} loading="lazy"
               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-70" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-[10px] tracking-[0.15em] uppercase font-heading text-[#00E5FF] glass px-2.5 py-1 rounded-full">
              {asset.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
              asset.license === "Pro" ? "bg-gradient-to-r from-[#009DFF] to-[#7C3AED] text-white" : "bg-white/10 text-white/80"
            }`}>{asset.license}</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-heading font-semibold text-white truncate">{asset.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <img src={resolveUrl(asset.creator?.avatar)} className="w-5 h-5 rounded-full" alt="" />
            <span className="text-xs text-[#B8C2CC]">by {asset.creator?.name || "Unknown"}</span>
            {asset.creator?.verified && <span className="text-[#00E5FF] text-xs">✦</span>}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-[#B8C2CC]/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Download size={12} strokeWidth={1.5} />{fmtNum(asset.downloads)}</span>
              <span className="flex items-center gap-1"><Heart size={12} strokeWidth={1.5} />{fmtNum(asset.likes)}</span>
              <span className="flex items-center gap-1"><Eye size={12} strokeWidth={1.5} />{fmtNum(asset.views)}</span>
            </div>
          </div>
        </div>
      </Link>
      {onFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); onFavorite(asset); }}
          className={`absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition ${
            asset.is_favorited ? "bg-[#00E5FF] text-[#050510]" : "glass"
          }`}
          data-testid="favorite-btn"
        >
          <Heart size={14} strokeWidth={2} fill={asset.is_favorited ? "currentColor" : "none"} />
        </button>
      )}
    </motion.div>
  );
}
