import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import mascot from "@/assets/mascot.png";
import sticker1 from "@/assets/sticker-1.png";
import sticker2 from "@/assets/sticker-2.png";
import sticker3 from "@/assets/sticker-3.png";
import sticker4 from "@/assets/sticker-4.png";
import sticker5 from "@/assets/sticker-5.png";
import sticker6 from "@/assets/sticker-6.png";
import sticker7 from "@/assets/sticker-7.png";
import sticker8 from "@/assets/sticker-8.png";
import sticker9 from "@/assets/sticker-9.png";
import sticker10 from "@/assets/sticker-10.png";
import { getTokenStats, type TokenStats } from "@/lib/token.functions";
import {
  CONTRACT_ADDRESS,
  CA_DISPLAY,
  HAS_CA,
  PUMPFUN_URL,
  DEXSCREENER_URL,
  SOLSCAN_URL,
  BIRDEYE_URL,
} from "@/lib/token.config";
import { RugCheck } from "@/components/RugCheck";

const CA = CONTRACT_ADDRESS;
const PUMPFUN = PUMPFUN_URL;
const TELEGRAM_STICKERS = "https://t.me/addstickers/KOPICAT20H";

const STICKERS: [string, string][] = [
  [sticker1, "$KOPICAT cat riding a rocket with coffee"],
  [sticker2, "$KOPICAT cat holding a green candle"],
  [sticker3, "$KOPICAT cat sleeping on a coffee cup"],
  [sticker4, "$KOPICAT cat crying over spilled coffee"],
  [sticker5, "$KOPICAT cat as a barista with a latte"],
  [sticker6, "$KOPICAT cat thumbs up next to a green arrow"],
  [sticker7, "$KOPICAT cat shocked at the chart"],
  [sticker8, "$KOPICAT cat king on a pile of gold coins"],
  [sticker9, "$KOPICAT cat coding at night with coffee"],
  [sticker10, "$KOPICAT cat blowing a heart kiss"],
];



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "$KOPICAT — The Coffee Cat Meme Coin on Solana" },
      {
        name: "description",
        content:
          "$KOPICAT is the most caffeinated cat on Solana. Read the lore, tokenomics, how to buy on pump.fun, roadmap, and verify the official contract address.",
      },
      { property: "og:title", content: "$KOPICAT — The Coffee Cat Meme Coin on Solana" },
      {
        property: "og:description",
        content: "Lore, tokenomics, how to buy, and meme gallery for $KOPICAT. Coffee first, moon second.",
      },
    ],
  }),
  component: Index,
});

const nav = [
  ["lore", "Lore"],
  ["tokenomics", "Tokenomics"],
  ["rug-check", "Rug Check"],
  ["how-to-buy", "How to Buy"],
  ["roadmap", "Roadmap"],
  ["memes", "Memes"],
];

const COLORS = {
  circulating: "oklch(0.78 0.19 62)",
  curve: "oklch(0.6 0.05 60)",
};

const compact = (n: number | null | undefined, prefix = "") =>
  n == null ? "—" : prefix + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);

const usd = (n: number | null | undefined) =>
  n == null
    ? "—"
    : n < 0.01
      ? `$${n.toPrecision(3)}`
      : `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n)}`;

function Pie({ stats }: { stats?: TokenStats | undefined }) {
  const total = stats?.totalSupply ?? 0;
  const inCurve = stats?.inCurve ?? null;
  const circPct = total && inCurve != null ? ((total - inCurve) / total) * 100 : 100;
  const stops = `${COLORS.circulating} 0% ${circPct}%, ${COLORS.curve} ${circPct}% 100%`;
  return (
    <div
      className="mx-auto aspect-square w-56 rounded-full border-2 border-border sm:w-72"
      style={{ backgroundImage: `conic-gradient(${stops})` }}
      role="img"
      aria-label="Live token supply distribution chart"
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-1/2 w-1/2 flex-col items-center justify-center rounded-full bg-background text-center">
          <span className="font-display text-lg text-primary">{compact(stats?.totalSupply)}</span>
          <span className="text-[10px] text-muted-foreground">total supply</span>
        </div>
      </div>
    </div>
  );
}


function Index() {
  const [copied, setCopied] = useState(false);
  const fetchStats = useServerFn(getTokenStats);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["token-stats", CA],
    queryFn: () => fetchStats(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });


  const copy = async () => {
    if (!HAS_CA) return;
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#top" className="flex items-center gap-2 font-display text-lg">
            <img src={mascot} alt="$KOPICAT cat mascot" width={40} height={40} className="h-9 w-9" />
            $KOPICAT
          </a>
          <nav className="hidden gap-6 text-sm md:flex">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-muted-foreground transition-colors hover:text-primary">
                {label}
              </a>
            ))}
          </nav>
          <a
            href={PUMPFUN}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-5 py-2 font-display text-sm text-primary-foreground transition-transform hover:scale-105"
          >
            Buy Now
          </a>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero-bg border-b border-border">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <span className="inline-block rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                Launched on pump.fun · Solana · Fair launch
              </span>
              <h1 className="mt-5 text-5xl leading-tight sm:text-6xl whitespace-pre-line">
                $KOPICAT{"\n"}
                <span className="text-primary">The Coffee Cat</span>
              </h1>
              <p className="mt-4 max-w-md text-lg text-muted-foreground">
                The most caffeinated cat on Solana. Sleeps 20 hours, pumps for 4. Coffee first, moon second.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={PUMPFUN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow rounded-full bg-primary px-7 py-3 font-display text-primary-foreground transition-transform hover:scale-105"
                >
                  Buy on pump.fun
                </a>
                {DEXSCREENER_URL ? (
                  <a
                    href={DEXSCREENER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border-2 border-border px-7 py-3 font-display transition-colors hover:border-primary hover:text-primary"
                  >
                    View Chart
                  </a>
                ) : (
                  <span className="cursor-not-allowed rounded-full border-2 border-border px-7 py-3 font-display text-muted-foreground opacity-60">
                    Chart Coming Soon
                  </span>
                )}
              </div>

              <div className="pop-card mt-8 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Contract Address</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <code className="break-all text-sm text-primary">{CA_DISPLAY}</code>
                  <button
                    onClick={copy}
                    disabled={!HAS_CA}
                    className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary disabled:hover:text-secondary-foreground"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <a className="hover:text-primary" href={PUMPFUN} target="_blank" rel="noopener noreferrer">
                    pump.fun ↗
                  </a>
                  {SOLSCAN_URL && (
                    <a className="hover:text-primary" href={SOLSCAN_URL} target="_blank" rel="noopener noreferrer">
                      Solscan ↗
                    </a>
                  )}
                  {BIRDEYE_URL && (
                    <a className="hover:text-primary" href={BIRDEYE_URL} target="_blank" rel="noopener noreferrer">
                      Birdeye ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            <img
              src={mascot}
              alt="$KOPICAT mascot: an orange cat wearing sunglasses holding a cup of coffee"
              width={1024}
              height={1024}
              className="wiggle mx-auto w-64 drop-shadow-2xl sm:w-80 md:w-full md:max-w-md"
            />
          </div>
        </section>

        {/* LORE */}
        <section id="lore" className="border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
            <h2 className="text-3xl sm:text-4xl">Lore</h2>
            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
              <p>
                Back in 2021, an orange cat named Kopicat fell asleep on a trader's laptop while the charts
                were open. His butt accidentally hit the buy button. That trader got rich.
              </p>
              <p>
                Ever since, Kopicat has been believed to have sharper market instincts than 400 indicators
                combined. He only asks for one thing in return: coffee, every morning, no sugar.
              </p>
              <p className="text-foreground">
                $KOPICAT exists to fund this cat's caffeine habit — and the community that believes the best
                financial decisions happen after the first cup.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Fair launch", "No presale, no VCs, no insiders. Bonded on pump.fun."],
                ["LP burned", "Liquidity locked forever after bonding."],
                ["Contract renounced", "Nobody can touch the supply."],
              ].map(([t, d]) => (
                <div key={t} className="pop-card p-5">
                  <h3 className="text-base text-primary">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TOKENOMICS */}
        <section id="tokenomics" className="border-b border-border bg-card/30">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
            <div>
              <h2 className="text-3xl sm:text-4xl">Tokenomics</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Live on-chain data for{" "}
                <code className="text-primary">{CA_DISPLAY}</code>
                {stats ? ` · ${stats.name} ($${stats.symbol})` : isLoading ? " · loading…" : ""}
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {[
                  ["Total Supply", compact(stats?.totalSupply)],
                  ["Price", usd(stats?.priceUsd)],
                  ["Market Cap", compact(stats?.marketCapUsd, "$")],
                  ["24h Volume", compact(stats?.volume24hUsd, "$")],
                  ["Liquidity", compact(stats?.liquidityUsd, "$")],
                  [
                    "24h Change",
                    stats?.priceChange24h != null ? `${stats.priceChange24h > 0 ? "+" : ""}${stats.priceChange24h}%` : "—",
                  ],
                  ["Network", "Solana (SPL)"],
                  ["Buy / Sell Tax", "0% / 0%"],
                ].map(([k, v]) => (
                  <div key={k} className="pop-card p-4">
                    <dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt>
                    <dd className="mt-1 font-display text-lg text-primary">{isLoading ? "…" : v}</dd>
                  </div>
                ))}
              </dl>

              <div className="pop-card mt-6 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bonding curve progress</span>
                  <span className="font-display text-primary">
                    {stats?.complete ? "Bonded ✓" : stats?.bondingProgress != null ? `${stats.bondingProgress.toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${stats?.complete ? 100 : (stats?.bondingProgress ?? 0)}%` }}
                  />
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {[
                  ["Circulating / traded", COLORS.circulating, stats?.circulating],
                  ["Still in bonding curve", COLORS.curve, stats?.inCurve],
                ].map(([label, color, value]) => (
                  <li key={label as string} className="flex items-center gap-3 text-sm">
                    <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: color as string }} aria-hidden />
                    <span className="flex-1 text-muted-foreground">{label as string}</span>
                    <span className="font-display">{compact(value as number | null)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Data pulled live from pump.fun and DexScreener. Always verify on-chain before buying.
              </p>
            </div>
            <Pie stats={stats} />
          </div>
        </section>


        <RugCheck />

        {/* HOW TO BUY */}
        <section id="how-to-buy" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <h2 className="text-3xl sm:text-4xl">How to Buy</h2>
            <p className="mt-3 text-muted-foreground">First time? Four steps, five minutes.</p>
            <ol className="mt-8 grid gap-5 md:grid-cols-4">
              {[
                ["Install Phantom", "Download the Phantom wallet app or browser extension and store your seed phrase offline."],
                ["Get some SOL", "Buy SOL on any exchange and send it to your Phantom wallet address."],
                ["Open pump.fun", "Connect your wallet on pump.fun and open the official $KOPICAT coin page."],
                ["Swap for $KOPICAT", "Enter your amount, set slippage to 3-5%, and confirm. Welcome to the litter."],
              ].map(([t, d], i) => (
                <li key={t} className="pop-card p-6">
                  <span className="font-display text-3xl text-primary">0{i + 1}</span>
                  <h3 className="mt-3 text-base">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </li>
              ))}
            </ol>
            <a
              href={PUMPFUN}
              target="_blank"
              rel="noopener noreferrer"
              className="glow mt-8 inline-block rounded-full bg-primary px-7 py-3 font-display text-primary-foreground transition-transform hover:scale-105"
            >
              Take me to pump.fun
            </a>
          </div>
        </section>

        {/* ROADMAP */}
        <section id="roadmap" className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
            <h2 className="text-3xl sm:text-4xl">Roadmap</h2>
            <div className="mt-8 space-y-5">
              {[
                ["Phase 1 — Just Woke Up", ["Fair launch on pump.fun", "Bonding curve completed", "First 1,000 holders"]],
                ["Phase 2 — First Sip", ["Trending on DexScreener", "CoinGecko & CMC listings", "Weekly meme contests"]],
                ["Phase 3 — Fully Caffeinated", ["KOL marketing push", "10,000 holders", "Merch & sticker packs"]],
                ["Phase 4 — To The Moon (for real)", ["Tier-2 CEX listing", "Cat community collabs", "Donations to cat shelters"]],
              ].map(([title, items]) => (
                <div key={title as string} className="pop-card p-6">
                  <h3 className="text-lg text-primary">{title as string}</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                    {(items as string[]).map((it) => (
                      <li key={it}>• {it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MEMES */}
        <section id="memes" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <h2 className="text-3xl sm:text-4xl">Meme Gallery</h2>
            <p className="mt-3 text-muted-foreground">
              10 $KOPICAT stickers, ready for Telegram. Grab the pack and spam every chat.
            </p>
            <a
              href={TELEGRAM_STICKERS}
              target="_blank"
              rel="noopener noreferrer"
              className="glow mt-6 inline-block rounded-full bg-primary px-7 py-3 font-display text-primary-foreground transition-transform hover:scale-105"
            >
              Add Telegram Sticker Pack
            </a>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {STICKERS.map(([src, alt]) => (
                <img
                  key={alt}
                  src={src}
                  alt={alt}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="pop-card w-full bg-card/50 p-2 transition-transform hover:-rotate-2 hover:scale-105"
                />
              ))}
            </div>
          </div>
        </section>


        {/* COMMUNITY */}
        <section id="community" className="hero-bg">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
            <h2 className="text-3xl sm:text-4xl">Join the Cat Cult</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              The $KOPICAT community runs 24/7 — just like a cat that wakes you up at 3 AM.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="https://x.com/KOPI_CAT_20H"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-border bg-card px-7 py-3 font-display transition-colors hover:border-primary hover:text-primary"
              >
                X (Twitter)
              </a>
              <a
                href={TELEGRAM_STICKERS}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-border bg-card px-7 py-3 font-display transition-colors hover:border-primary hover:text-primary"
              >
                Telegram Stickers
              </a>
              <a
                href="https://t.me/kopicat_comuunity"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-border bg-card px-7 py-3 font-display transition-colors hover:border-primary hover:text-primary"
              >
                Telegram Group
              </a>
              <a
                href="/game"
                target="_blank"
                rel="noopener noreferrer"
                className="glow rounded-full bg-primary px-7 py-3 font-display text-primary-foreground transition-transform hover:scale-105"
              >
                🎮 Play Kopicat Clicker
              </a>

            </div>

          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-foreground">CA:</span>
            <code className="break-all text-primary">{CA_DISPLAY}</code>
            <button onClick={copy} disabled={!HAS_CA} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary disabled:hover:text-secondary-foreground">
              {copied ? "Copied!" : "Copy"}
            </button>
            <a className="hover:text-primary" href={PUMPFUN} target="_blank" rel="noopener noreferrer">
              pump.fun ↗
            </a>
          </div>
          <p>
            Disclaimer: $KOPICAT is a meme coin with no utility and no promise of financial return.
            Crypto is highly risky — DYOR and never invest more than you can afford to lose.
            LP burn and mint revoke proofs are verifiable on Solscan.
          </p>
          <p>© {new Date().getFullYear()} $KOPICAT. Built by the community, for the cat.</p>
        </div>
      </footer>
    </div>
  );
}
