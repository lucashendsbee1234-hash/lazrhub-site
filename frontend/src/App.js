import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import CustomCursor from "@/components/CustomCursor";
import ParticleField from "@/components/ParticleField";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import AssetDetail from "@/pages/AssetDetail";
import Upload from "@/pages/Upload";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import CreatorProfile from "@/pages/CreatorProfile";
import Collections from "@/pages/Collections";
import Leaderboards from "@/pages/Leaderboards";

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <LoadingScreen show={loading} />
        <CustomCursor />
        <ParticleField />
        <div className="relative z-10 min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/creator/:username" element={<CreatorProfile />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
          </Routes>
          <Footer />
        </div>
        <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: "rgba(16,24,39,0.9)", border: "1px solid rgba(0,229,255,0.3)", color: "white", backdropFilter: "blur(12px)" } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
