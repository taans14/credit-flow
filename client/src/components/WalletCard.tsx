type Props = {
  email: string;
  credits: number;
  loading?: boolean;
};

export default function WalletCard({ email, credits, loading }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-sm text-zinc-400">Logged in as:</p>
      <p className="mt-1 break-all font-semibold text-white">{email}</p>

      <div className="mt-5">
        <p className="text-sm text-zinc-400">Credits</p>
        <p className="mt-2 text-4xl font-black">
          {loading ? "…" : credits.toLocaleString()}
        </p>
      </div>

      <p className="mt-3 text-xs text-zinc-400">Fetch: GET /credits/me</p>
    </div>
  );
}
