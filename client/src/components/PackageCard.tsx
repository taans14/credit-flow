type PackageFeature = {
  feature?: {
    code: string;
  };
};

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: string | number;
  features?: PackageFeature[];
};

type Props = {
  pkg: CreditPackage;
  buying?: boolean;
  onBuy: (packageId: string) => void;
};

function formatUsd(value: string | number) {
  const asNumber = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(asNumber)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(asNumber);
  }

  return `$${String(value)}`;
}

export default function PackageCard({ pkg, buying, onBuy }: Props) {
  const featureCodes = (pkg.features ?? [])
    .map((f) => f.feature?.code)
    .filter((code): code is string => !!code);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">{pkg.name}</h3>
          <p className="mt-2 text-sm text-zinc-300">
            <span className="font-semibold text-white">{pkg.credits}</span>{" "}
            credits
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-zinc-400">Price</p>
          <p className="mt-1 text-lg font-bold text-white">
            {formatUsd(pkg.price)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm text-zinc-400">Includes features</p>
        {featureCodes.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-300">None</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-zinc-200">
            {featureCodes.map((code) => (
              <li key={code} className="font-mono">
                {code}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => onBuy(pkg.id)}
        disabled={!!buying}
        className="mt-6 w-full rounded-2xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.01] disabled:opacity-50"
      >
        {buying ? "Buying…" : "Buy"}
      </button>

      <p className="mt-3 text-xs text-zinc-400">
        Calls: POST /credits/purchase/:packageId
      </p>
    </div>
  );
}

export type { CreditPackage };
