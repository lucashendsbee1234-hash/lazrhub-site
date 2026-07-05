import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Upload, LayoutDashboard, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
          <div className="relative w-8 h-8 logo-spin">
            <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.7)]" />
            <div className="absolute inset-1 rounded-full border border-[#7C3AED]" />
            <div className="absolute inset-3 rounded-full bg-[#00E5FF]" />
          </div>
          <span className="font-heading font-black tracking-tight text-lg">LazR<span className="text-[#00E5FF]">Hub</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#B8C2CC]">
          <Link to="/explore" className="hover:text-white transition" data-testid="nav-explore">Explore</Link>
          <Link to="/collections" className="hover:text-white transition" data-testid="nav-collections">Collections</Link>
          <Link to="/leaderboards" className="hover:text-white transition" data-testid="nav-leaderboards">Leaderboards</Link>
          <Link to="/upload" className="hover:text-white transition" data-testid="nav-upload">Upload</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/upload" className="hidden sm:inline-flex btn-primary !py-2 !px-5 !text-xs" data-testid="nav-upload-btn">
                <Upload size={14} strokeWidth={2} /> Upload
              </Link>
              <Link to="/dashboard" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:border-[#00E5FF]/50 transition" data-testid="nav-dashboard">
                <LayoutDashboard size={16} className="text-[#00E5FF]" strokeWidth={1.5} />
              </Link>
              <button onClick={async () => { await logout(); navigate("/"); }} className="glass w-10 h-10 rounded-full flex items-center justify-center hover:border-red-400/50 transition" data-testid="nav-logout">
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#B8C2CC] hover:text-white transition" data-testid="nav-login">Log in</Link>
              <Link to="/register" className="btn-primary !py-2 !px-5 !text-xs" data-testid="nav-signup">
                <User size={14} strokeWidth={2} /> Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
