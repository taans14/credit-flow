type PurchaseRow = {
  id: string;
  createdAt: string;
  totalPrice?: string | number;
  creditPackage?: {
    name: string;
    price?: string | number;
  };
};

type Props = {
  rows: PurchaseRow[];
  loading?: boolean;
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

export default function PurchaseHistory({ rows, loading }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Purchase History</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Fetch: GET /credits/history
          </p>
        </div>

        {loading ? <p className="text-sm text-zinc-400">Loading…</p> : null}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 font-semibold">Package</th>
              <th className="py-3 pr-4 font-semibold">Price</th>
              <th className="py-3 pr-4 font-semibold">Date</th>
            </tr>
          </thead>

          <tbody className="text-zinc-200">
            {rows.length === 0 ? (
              <tr>
                <td className="py-4 text-zinc-400" colSpan={3}>
                  No purchases yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-semibold text-white">
                    {row.creditPackage?.name ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {row.totalPrice != null
                      ? formatUsd(row.totalPrice)
                      : row.creditPackage?.price != null
                        ? formatUsd(row.creditPackage.price)
                        : "—"}
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { PurchaseRow };
