import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import DevspaceLogo from "@/components/DevspaceLogo";
import type { Role } from "@/data/mock";

interface Props {
  onLogin: (role: Role, name: string) => void;
}

const accounts = [
  { username: "fazrilukman", password: "admin123", role: "admin" as Role, name: "Fazri Lukman" },
  { username: "fahminashruddin", password: "manager123", role: "manager" as Role, name: "Fahmi Nashruddin" },
];

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const acc = accounts.find(a => a.username === username && a.password === password);
      if (acc) {
        onLogin(acc.role, acc.name);
      } else {
        setError("Username atau password salah. Silakan coba kembali.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center relative overflow-hidden">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute border border-[#E2E6EC] rounded-lg opacity-40"
            style={{
              width: 80 + i * 60,
              height: 80 + i * 60,
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white rounded-xl border border-[#E2E6EC] shadow-sm p-6 sm:p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <DevspaceLogo size={44} withText={false} />
            <div className="mt-3 text-center">
              <div className="text-xl font-bold text-[#172033]">DEVSPACE</div>
              <div className="text-xs text-[#667085] mt-0.5">Sistem Invoicing & Billing</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full h-10 pl-9 pr-4 rounded-md border border-[#E2E6EC] text-sm text-[#172033] placeholder-[#9CA3AF] focus:outline-none focus:border-[#173B6C] focus:ring-2 focus:ring-[#173B6C]/10 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full h-10 pl-9 pr-10 rounded-md border border-[#E2E6EC] text-sm text-[#172033] placeholder-[#9CA3AF] focus:outline-none focus:border-[#173B6C] focus:ring-2 focus:ring-[#173B6C]/10 transition"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#667085]">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#173B6C] hover:bg-[#102D54] text-white text-sm font-semibold rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2E6EC]">
            <div className="text-xs text-[#9CA3AF] text-center mb-3">Demo akun tersedia:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => { setUsername("fazrilukman"); setPassword("admin123"); }}
                className="text-[11px] px-3 py-2 border border-[#E2E6EC] rounded text-[#667085] hover:bg-gray-50 text-left"
              >
                <div className="font-medium text-[#172033]">Admin / Finance</div>
                <div>fazrilukman</div>
              </button>
              <button
                onClick={() => { setUsername("fahminashruddin"); setPassword("manager123"); }}
                className="text-[11px] px-3 py-2 border border-[#E2E6EC] rounded text-[#667085] hover:bg-gray-50 text-left"
              >
                <div className="font-medium text-[#172033]">Pimpinan / Manager</div>
                <div>fahminashruddin</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-[#9CA3AF]">
          PT. Ruang Kreasi Aplikasi &copy; 2026
        </div>
      </div>
    </div>
  );
}
