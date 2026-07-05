import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { fmtNum } from "../lib/api";

export default function CategoryCard({ cat, index }) {
  const Icon = Icons[cat.icon] || Icons.Sparkles;
  return (
    <Link to={`/explore?category=${cat.slug}`} data-testid={`category-${cat.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.04 }}
        whileHover={{ y: -6 }}
        className="relative card-lazr p-6 flex flex-col gap-4 overflow-hidden group h-full"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#7C3AED]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <div className="w-12 h-12 rounded-xl glass flex items-center justify-center border-[#00E5FF]/20 group-hover:border-[#00E5FF]/60 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all">
            <Icon size={22} strokeWidth={1.5} className="text-[#00E5FF]" />
          </div>
        </div>
        <div>
          <div className="font-heading font-semibold text-white text-lg">{cat.name}</div>
          <div className="text-xs text-[#B8C2CC]/70 mt-1">{fmtNum(cat.count)} assets</div>
        </div>
        <div className="mt-auto flex items-center gap-1 text-xs text-[#00E5FF] opacity-0 group-hover:opacity-100 transition">
          Explore <Icons.ArrowUpRight size={12} strokeWidth={2} />
        </div>
      </motion.div>
    </Link>
  );
}
