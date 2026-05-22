import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  enabled: boolean;
  buttonLabel: string;
  disabledLabel?: string;
  loading?: boolean;
  onClick: () => void;
  result?: ReactNode;
};

export default function FeatureCard({
  title,
  description,
  enabled,
  buttonLabel,
  disabledLabel = "Upgrade package",
  loading,
  onClick,
  result,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="mt-2 text-sm text-zinc-300">{description}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-zinc-400">Status</p>
          <p
            className={`mt-1 text-sm font-semibold ${
              enabled ? "text-emerald-300" : "text-zinc-400"
            }`}
          >
            {enabled ? "Unlocked" : "Locked"}
          </p>
        </div>
      </div>

      <button
        onClick={onClick}
        disabled={!enabled || !!loading}
        className="mt-5 w-full rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
      >
        {enabled ? (loading ? "Calling…" : buttonLabel) : disabledLabel}
      </button>

      {result ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-200">
          {result}
        </div>
      ) : null}
    </div>
  );
}
