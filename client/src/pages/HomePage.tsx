import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();

    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              Dashboard
            </p>

            <h1 className="text-2xl font-black">Credits SaaS</h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-2 text-red-300 transition hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Welcome back, {user?.fullName}
          </p>

          <h2 className="max-w-2xl text-5xl font-black leading-tight">
            Your authentication system is working perfectly.
          </h2>

          <p className="mt-5 max-w-2xl text-zinc-300">
            Next up: protected routes, subscriptions, payments, usage tracking,
            and a beautiful SaaS experience.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-[1.02]">
              Create Project
            </button>

            <button className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 transition hover:bg-white/10">
              View Analytics
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Total Credits</p>

            <h3 className="mt-3 text-5xl font-black">1,240</h3>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">API Requests</p>

            <h3 className="mt-3 text-5xl font-black">84K</h3>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Active Plan</p>

            <h3 className="mt-3 text-5xl font-black">PRO</h3>
          </div>
        </div>
      </main>
    </div>
  );
}
