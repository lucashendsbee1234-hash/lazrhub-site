import { Twitter, Instagram, Github, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/lazr-logo.png" alt="LazR Hub" className="w-10 h-10 object-contain drop-shadow-[0_0_14px_rgba(0,229,255,0.5)]" />
            <span className="font-heading font-black text-lg">LazR<span className="text-[#00E5FF]">Hub</span></span>
          </div>
          <p className="text-sm text-[#B8C2CC]/80 leading-relaxed">A home for creators to upload and discover amazing digital assets.</p>
          <div className="flex gap-3 mt-6">
            {[Twitter, Instagram, Github, Send].map((Icon, i) => (
              <a key={i} href="#" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:border-[#00E5FF]/50 transition">
                <Icon size={16} strokeWidth={1.5} className="text-[#B8C2CC]" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[#009DFF] mb-4 font-heading">Explore</div>
          <ul className="space-y-2 text-sm text-[#B8C2CC]">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/explore" className="hover:text-white">Explore</Link></li>
            <li><Link to="/collections" className="hover:text-white">Collections</Link></li>
            <li><Link to="/leaderboards" className="hover:text-white">Leaderboards</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[#009DFF] mb-4 font-heading">Create</div>
          <ul className="space-y-2 text-sm text-[#B8C2CC]">
            <li><Link to="/upload" className="hover:text-white">Upload</Link></li>
            <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
            <li><a className="hover:text-white" href="#">Creator Program</a></li>
            <li><a className="hover:text-white" href="#">API</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[#009DFF] mb-4 font-heading">Company</div>
          <ul className="space-y-2 text-sm text-[#B8C2CC]">
            <li><a className="hover:text-white" href="#">About</a></li>
            <li><a className="hover:text-white" href="#">Privacy</a></li>
            <li><a className="hover:text-white" href="#">Terms</a></li>
            <li><a className="hover:text-white" href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-[#B8C2CC]/60">
        © 2026 LazR Hub. Built for creators of the future.
      </div>
    </footer>
  );
}
