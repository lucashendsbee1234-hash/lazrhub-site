import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Twitter, Instagram, Globe, Check } from "lucide-react";
import { api, fmtNum, resolveUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import AssetCard from "../components/AssetCard";

export default function CreatorProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [creator, setCreator] = useState(null);
  const [assets, setAssets] = useState([]);
  const [following, setFollowing] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/users/${username}`);
    setCreator(data);
    setFollowing(user ? data.followers?.includes(user.user_id) : false);
    const a = await api.get("/assets", { params: { creator_id: data.user_id, limit: 60 } });
    setAssets(a.data);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [username, user]);

  if (!creator) return <div className="pt-32 text-center text-[#B8C2CC]">Loading…</div>;

  const follow = async () => {
    if (!user) { window.location.href = "/login"; return; }
    const { data } = await api.post(`/users/${username}/follow`);
    setFollowing(data.following);
    setCreator({ ...creator, followers_count: (creator.followers_count || 0) + (data.following ? 1 : -1) });
  };

  return (
    <div className="pt-24 min-h-screen">
      <div className="relative h-52 md:h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/30 via-[#009DFF]/20 to-[#7C3AED]/40" />
        <div className="absolute inset-0 grid-bg" />
        {creator.banner && <img src={resolveUrl(creator.banner)} className="w-full h-full object-cover opacity-70" alt="" />}
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
          <img src={resolveUrl(creator.avatar)} className="w-28 h-28 rounded-2xl ring-4 ring-[#050510] object-cover" alt="" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-3xl md:text-4xl font-black">{creator.name}</h1>
              {creator.verified && <span className="w-6 h-6 bg-[#00E5FF] rounded-full text-[#050510] text-xs font-bold flex items-center justify-center"><Check size={12} strokeWidth={3} /></span>}
            </div>
            <div className="text-[#B8C2CC] text-sm">@{creator.username}</div>
            {creator.bio && <div className="mt-3 text-[#B8C2CC] max-w-2xl">{creator.bio}</div>}
            <div className="flex gap-4 mt-4 text-sm text-[#B8C2CC]">
              <span><b className="text-white">{fmtNum(creator.followers_count)}</b> followers</span>
              <span><b className="text-white">{fmtNum(creator.uploads)}</b> uploads</span>
              <span><b className="text-white">{fmtNum(creator.total_downloads)}</b> DL</span>
              <span><b className="text-white">{fmtNum(creator.total_likes)}</b> likes</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {creator.twitter && <a href={`https://twitter.com/${creator.twitter}`} target="_blank" rel="noreferrer" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:border-[#00E5FF]/50 transition"><Twitter size={14} /></a>}
            {creator.instagram && <a href={`https://instagram.com/${creator.instagram}`} target="_blank" rel="noreferrer" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:border-[#00E5FF]/50 transition"><Instagram size={14} /></a>}
            {creator.website && <a href={`https://${creator.website}`} target="_blank" rel="noreferrer" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:border-[#00E5FF]/50 transition"><Globe size={14} /></a>}
            {user && user.user_id !== creator.user_id && (
              <button onClick={follow} className={following ? "btn-secondary" : "btn-primary"} data-testid="follow-btn">
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#00E5FF] font-heading mb-4">— Uploads</div>
          {assets.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-[#B8C2CC]">No uploads yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {assets.map((a, i) => <AssetCard key={a.asset_id} asset={a} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
