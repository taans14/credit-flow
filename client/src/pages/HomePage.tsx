import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { api } from "../api/axios";
import PackageCard, { type CreditPackage } from "../components/PackageCard";
import WalletCard from "../components/WalletCard";
import FeatureCard from "../components/FeatureCard";
import PurchaseHistory, {
  type PurchaseRow,
} from "../components/PurchaseHistory";

import { useEffect, useMemo, useState } from "react";

type CreditsMe = {
  balance: number;
  features: string[];
};

const ALL_FEATURES = ["IMAGE_GENERATION", "AUTO_POST", "ANALYTICS"] as const;
type FeatureCode = (typeof ALL_FEATURES)[number];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [creditsMe, setCreditsMe] = useState<CreditsMe>({
    balance: 0,
    features: [],
  });
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [history, setHistory] = useState<PurchaseRow[]>([]);

  const [loadingCredits, setLoadingCredits] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [purchaseLoadingId, setPurchaseLoadingId] = useState<string | null>(
    null,
  );
  const [purchaseMessage, setPurchaseMessage] = useState<string>("");
  const [pageError, setPageError] = useState<string>("");

  const [imageDemoLoading, setImageDemoLoading] = useState(false);
  const [autoPostLoading, setAutoPostLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [imageResult, setImageResult] = useState<{
    prompt: string;
    imageUrl: string;
  } | null>(null);
  const [autoPostResult, setAutoPostResult] = useState<{
    content: string;
  } | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<{
    totalPosts: number;
    totalImagesGenerated: number;
    engagementRate: string;
    monthlyViews: number;
  } | null>(null);

  useEffect(() => {
    void initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initialLoad() {
    setPageError("");
    await Promise.all([
      refetchCreditsMe(),
      refetchPackages(),
      refetchHistory(),
    ]);
  }

  async function refetchCreditsMe() {
    try {
      setLoadingCredits(true);
      const response = await api.get("/credits/me");
      setCreditsMe(response.data.data);
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Failed to load credits");
    } finally {
      setLoadingCredits(false);
    }
  }

  async function refetchPackages() {
    try {
      setLoadingPackages(true);
      const response = await api.get("/credit-packages");
      setPackages(response.data.data);
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Failed to load packages");
    } finally {
      setLoadingPackages(false);
    }
  }

  async function refetchHistory() {
    try {
      setLoadingHistory(true);
      const response = await api.get("/credits/history");
      setHistory(response.data.data);
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }

  const unlocked = useMemo(
    () => new Set(creditsMe.features),
    [creditsMe.features],
  );
  const isUnlocked = (feature: FeatureCode) => unlocked.has(feature);

  async function handleLogout() {
    await logout();

    navigate("/login");
  }

  async function handleBuy(packageId: string) {
    try {
      setPurchaseMessage("");
      setPageError("");
      setPurchaseLoadingId(packageId);

      const response = await api.post(`/credits/purchase/${packageId}`);

      setPurchaseMessage(response.data.message || "Purchase successful");

      // VERY important for UX (assignment requirement)
      await Promise.all([refetchCreditsMe(), refetchHistory()]);
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Purchase failed");
    } finally {
      setPurchaseLoadingId(null);
    }
  }

  async function callGenerateImage() {
    try {
      setPageError("");
      setImageDemoLoading(true);
      const response = await api.post("/features/generate-image", {
        prompt: "cat astronaut",
      });
      setImageResult(response.data.data);

      await refetchCreditsMe();
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Generate image failed");
    } finally {
      setImageDemoLoading(false);
    }
  }

  async function callAutoPost() {
    try {
      setPageError("");
      setAutoPostLoading(true);
      const response = await api.post("/features/auto-post", {
        content: "Hello from Credit SaaS",
      });
      setAutoPostResult(response.data.data);

      await refetchCreditsMe();
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Auto post failed");
    } finally {
      setAutoPostLoading(false);
    }
  }

  async function callAnalytics() {
    try {
      setPageError("");
      setAnalyticsLoading(true);
      const response = await api.get("/features/analytics");
      setAnalyticsResult(response.data.data);

      await refetchCreditsMe();
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Analytics failed");
    } finally {
      setAnalyticsLoading(false);
    }
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
        {pageError ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {pageError}
          </div>
        ) : null}

        {purchaseMessage ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {purchaseMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-10">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              Mini SaaS dashboard
            </p>

            <h2 className="max-w-2xl text-4xl font-black leading-tight">
              Welcome back, {user?.fullName}
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-300">
              Buy credit packages to increase your balance and unlock feature
              APIs.
            </p>
          </div>

          <div className="lg:col-span-1">
            <WalletCard
              email={user?.email ?? ""}
              credits={creditsMe.balance}
              loading={loadingCredits}
            />
          </div>
        </div>

        <section className="mt-10" aria-label="Available Packages">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">Available Packages</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Fetch: GET /credit-packages
              </p>
            </div>

            {loadingPackages ? (
              <p className="text-sm text-zinc-400">Loading…</p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                buying={purchaseLoadingId === pkg.id}
                onBuy={handleBuy}
              />
            ))}
          </div>
        </section>

        <section className="mt-10" aria-label="Unlocked Features">
          <h3 className="text-2xl font-black">Unlocked Features</h3>
          <p className="mt-1 text-sm text-zinc-400">From: GET /credits/me</p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="space-y-3">
              {ALL_FEATURES.map((code) => (
                <div key={code} className="flex items-center justify-between">
                  <p className="font-mono text-sm text-white">{code}</p>
                  <p className="text-sm">
                    {isUnlocked(code) ? (
                      <span className="text-emerald-300">✅</span>
                    ) : (
                      <span className="text-zinc-500">❌</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10" aria-label="Feature Demos">
          <h3 className="text-2xl font-black">Feature Demo Buttons</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Try locked vs unlocked behavior by purchasing packages.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Generate Image"
              description="Calls: POST /features/generate-image"
              enabled={isUnlocked("IMAGE_GENERATION")}
              loading={imageDemoLoading}
              buttonLabel="Generate Image"
              onClick={callGenerateImage}
              result={
                imageResult ? (
                  <div className="space-y-2">
                    <p className="text-zinc-300">Prompt:</p>
                    <p className="font-mono">{imageResult.prompt}</p>
                    <p className="text-zinc-300">Image URL:</p>
                    <a
                      href={imageResult.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all font-mono text-cyan-300 hover:text-cyan-200"
                    >
                      {imageResult.imageUrl}
                    </a>
                  </div>
                ) : null
              }
            />

            <FeatureCard
              title="Auto Post"
              description="Calls: POST /features/auto-post"
              enabled={isUnlocked("AUTO_POST")}
              loading={autoPostLoading}
              buttonLabel="Auto Post"
              onClick={callAutoPost}
              result={
                autoPostResult ? (
                  <div className="space-y-2">
                    <p className="text-zinc-300">Content:</p>
                    <p className="font-mono">{autoPostResult.content}</p>
                  </div>
                ) : null
              }
            />

            <FeatureCard
              title="View Analytics"
              description="Calls: GET /features/analytics"
              enabled={isUnlocked("ANALYTICS")}
              loading={analyticsLoading}
              buttonLabel="View Analytics"
              onClick={callAnalytics}
              result={
                analyticsResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-300">Total Posts</p>
                      <p className="font-mono">{analyticsResult.totalPosts}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-300">Images Generated</p>
                      <p className="font-mono">
                        {analyticsResult.totalImagesGenerated}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-300">Engagement</p>
                      <p className="font-mono">
                        {analyticsResult.engagementRate}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-300">Monthly Views</p>
                      <p className="font-mono">
                        {analyticsResult.monthlyViews}
                      </p>
                    </div>
                  </div>
                ) : null
              }
            />
          </div>
        </section>

        <section className="mt-10" aria-label="Purchase History">
          <PurchaseHistory rows={history} loading={loadingHistory} />
        </section>
      </main>
    </div>
  );
}
