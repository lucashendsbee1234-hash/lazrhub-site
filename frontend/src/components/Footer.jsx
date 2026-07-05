import { Twitter, Instagram, Github, Send, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const FOOTER = [
  {
    title: "Product",
    links: [{ to: "/explore", label: "Explore" }, { to: "/collections", label: "Collections" }, { to: "/leaderboards", label: "Leaderboard" }, { to: "/upload", label: "Upload" }],
  },
  {
    title: "Developers",
    links: [{ href: "#", label: "API" }, { href: "#", label: "Docs" }, { href: "#", label: "GitHub" }, { href: "#", label: "Status" }],
  },
  {
    title: "Company",
    links: [{ href: "#", label: "About" }, { href: "#", label: "Blog" }, { href: "#", label: "Support" }, { href: "#", label: "Contact" }],
  },
  {
    title: "Legal",
    links: [{ href: "#", label: "Privacy" }, { href: "#", label: "Terms" }, { href: "#", label: "Cookie policy" }, { href: "#", label: "Licenses" }],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/[0.06] bg-[#040409]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 grid md:grid-cols-6 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/lazr-logo.png" alt="LazR Hub" className="w-8 h-8 object-contain" />
            <span className="font-heading font-black text-base">LazR<span className="text-[#00E5FF]">Hub</span></span>
          </div>
          <p className="text-sm text-[#B8C2CC]/80 leading-relaxed max-w-sm">
            The creator hub for every digital file. Upload and discover images, video, audio, fonts, code, 3D models — anything.
          </p>
          <div className="flex gap-2 mt-5">
            {[Twitter, Instagram, Github, Send, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-md bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center transition text-[#B8C2CC] hover:text-white">
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
        {FOOTER.map((col) => (
          <div key={col.title}>
            <div className="text-xs uppercase tracking-widest text-[#B8C2CC]/60 font-medium mb-3">{col.title}</div>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => l.to ? (
                <li key={l.label}><Link to={l.to} className="text-[#B8C2CC] hover:text-white transition">{l.label}</Link></li>
              ) : (
                <li key={l.label}><a href={l.href} className="text-[#B8C2CC] hover:text-white transition">{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] py-5 px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#B8C2CC]/60">
          <div>© 2026 LazR Hub. Built for creators of the future.</div>
          <div className="flex items-center gap-4">
            <span>All systems operational</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
