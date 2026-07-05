import { Link } from "react-router-dom";
import { Download, Heart, Bookmark, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { fmtNum, resolveUrl } from "../lib/api";
import SmartPreview from "./SmartPreview";

export default function AssetCard({ asset, index = 0, onFavorite }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min((index % 8) * 0.04, 0.3), ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative rounded-xl overflow-hidden bg-[#0D111C] border border-white/[0.06] hover:border-white/15 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
      data-testid="asset-card"
    >
      <Link to={`/asset/${asset.asset_id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#080813]">
          <SmartPreview asset={asset} variant="card" />

          {/* Hover quick actions */}
          <div className="absolute inset-0 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="flex gap-2">
              {onFavorite && (
                <button
                  onClick={(e) => { e.preventDefault(); onFavorite(asset); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md transition ${
                    asset.is_favorited ? "bg-[#00E5FF] text-[#050510]" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title="Like"
                >
                  <Heart size={13} strokeWidth={2} fill={asset.is_favorited ? "currentColor" : "none"} />
                </button>
              )}
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                <Bookmark size={13} strokeWidth={2} />
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
              <ExternalLink size={13} strokeWidth={2} />
            </div>
          </div>

          {asset.license === "Pro" && (
            <div className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-md bg-gradient-to-r from-[#009DFF] to-[#7C3AED] text-white">PRO</div>
          )}
        </div>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm text-white truncate flex-1">{asset.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <img src={resolveUrl(asset.creator?.avatar)} className="w-4 h-4 rounded-full" alt="" />
            <span className="text-xs text-[#B8C2CC]/80 truncate">{asset.creator?.name || "Unknown"}</span>
            {asset.creator?.verified && <span className="text-[#00E5FF] text-[10px]">✦</span>}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05] text-[11px] text-[#B8C2CC]/70">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Download size={11} strokeWidth={1.5} />{fmtNum(asset.downloads)}</span>
              <span className="flex items-center gap-1"><Heart size={11} strokeWidth={1.5} />{fmtNum(asset.likes)}</span>
            </div>
            {asset.file_size && <span className="text-[10px] text-[#B8C2CC]/50">{asset.file_size}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
