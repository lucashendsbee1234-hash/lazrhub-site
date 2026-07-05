import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Flame, Download, Heart, Users } from "lucide-react";
import { api, fmtNum, resolveUrl } from "../lib/api";
import EmptyState from "../components/EmptyState";

const TABS = [
  { k: "creators-downloads", label: "Top Creators", Icon: Trophy },
  { k: "assets-downloads", label: "Most Downloaded", Icon: Download },
  { k: "assets-likes", label: "Most Liked", Icon: Heart },
  { k: "assets-trending", label: "Trending", Icon: Flame },
];

export default function Leaderboards() {
  const [tab, setTab] = useState("creators-downloads");
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      if (tab === "creators-downloads") {
        const r = await api.get("/leaderboards/creators", { params: { sort: "downloads", limit: 20 } });
        setData(r.data.map((x) => ({ ...x, type: "creator" })));
      } else {
        const [_, sort] = tab.split("-");
        const r = await api.get("/leaderboards/assets", { params: { sort, limit: 20 } });
        setData(r.data.map((x) => ({ ...x, type: "asset" })));
      }
    })();
  }, [tab]);

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto min-h-screen">
      <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-3">— Leaderboards</div>
      <h1 className="font-heading text-4xl md:text-6xl font-black mb-10">Hall of the future</h1>

      <div className="flex gap-2 flex-wrap mb-8">
        {TABS.map(({ k, label, Icon }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition ${
              tab === k ? "border border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF]" : "border border-white/10 bg-white/5 text-[#B8C2CC] hover:text-white"
            }`}
            data-testid={`leaderboard-tab-${k}`}
          >
            <Icon size={12} strokeWidth={1.5} /> {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <EmptyState
            icon={tab.startsWith("creators") ? Users : Trophy}
            title={tab.startsWith("creators") ? "No creators yet." : "No assets yet."}
            subtitle={tab.startsWith("creators") ? "Be the first to join LazR Hub." : "Be the first to upload an asset and top the charts."}
            action={<Link to={tab.startsWith("creators") ? "/register" : "/upload"} className="btn-primary mt-4">{tab.startsWith("creators") ? "Create account" : "Upload now"}</Link>}
          />
        ) : data.map((item, i) => (
          <div key={item.user_id || item.asset_id} className="card-lazr p-4 flex items-center gap-4">
            <div className={`font-heading font-black text-2xl w-10 text-center ${
              i === 0 ? "text-[#00E5FF]" : i === 1 ? "text-[#009DFF]" : i === 2 ? "text-[#7C3AED]" : "text-[#B8C2CC]/50"
            }`}>#{i + 1}</div>
            {item.type === "creator" ? (
              <Link to={`/creator/${item.username}`} className="flex items-center gap-4 flex-1">
                <img src={resolveUrl(item.avatar)} className="w-12 h-12 rounded-full ring-2 ring-[#00E5FF]/20" alt="" />
                <div className="flex-1">
                  <div className="font-heading font-semibold">{item.name} {item.verified && <span className="text-[#00E5FF]">✦</span>}</div>
                  <div className="text-xs text-[#B8C2CC]">@{item.username} · {item.uploads} uploads</div>
                </div>
                <div className="text-right">
                  <div className="font-heading font-black text-white">{fmtNum(item.total_downloads)}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/70">Downloads</div>
                </div>
              </Link>
            ) : (
              <Link to={`/asset/${item.asset_id}`} className="flex items-center gap-4 flex-1">
                <img src={resolveUrl(item.preview_url)} className="w-14 h-14 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <div className="font-heading font-semibold">{item.title}</div>
                  <div className="text-xs text-[#B8C2CC] uppercase">{item.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-heading font-black text-white">{fmtNum(item.downloads || item.likes || item.views)}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#B8C2CC]/70">{tab.endsWith("likes") ? "Likes" : tab.endsWith("trending") ? "Views" : "Downloads"}</div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
