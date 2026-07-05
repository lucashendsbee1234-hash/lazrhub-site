import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Auth({ mode = "login" }) {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "", username: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = mode === "login"
      ? await login(form.email, form.password)
      : await register({ email: form.email, password: form.password, name: form.name, username: form.username || undefined });
    setLoading(false);
    if (res.ok) { toast.success(mode === "login" ? "Welcome back ⚡" : "Account created ⚡"); navigate("/dashboard"); }
    else toast.error(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 relative">
      <div className="orb w-[400px] h-[400px] top-20 left-1/2 -translate-x-1/2 bg-[#00E5FF]/20" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass-strong rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.6)] logo-spin flex items-center justify-center">
              <Sparkles size={16} className="text-[#00E5FF]" />
            </div>
            <div>
              <div className="font-heading font-black text-lg">LazR<span className="text-[#00E5FF]">Hub</span></div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#B8C2CC]/70">{mode === "login" ? "Welcome Back" : "Join the future"}</div>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="input-lazr" data-testid="auth-name" />
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username (optional)" className="input-lazr" data-testid="auth-username" />
              </>
            )}
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input-lazr" data-testid="auth-email" />
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="input-lazr" data-testid="auth-password" />
            <button disabled={loading} type="submit" className="btn-primary w-full" data-testid="auth-submit">
              {loading ? "Please wait…" : (mode === "login" ? "Sign in" : "Create account")}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-[#B8C2CC]">
            {mode === "login" ? (
              <>New here? <Link to="/register" className="text-[#00E5FF] hover:underline">Create an account</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-[#00E5FF] hover:underline">Sign in</Link></>
            )}
          </div>
          {mode === "login" && (
            <div className="mt-4 text-center text-xs text-[#B8C2CC]/60">
              Try demo: admin@lazrhub.com / admin123
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
