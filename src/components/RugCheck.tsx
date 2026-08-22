import { useState } from "react";
import mascot from "@/assets/mascot.png";

type Level = "safe" | "warn" | "danger" | "unknown";
type Source = "GoPlus" | "RugCheck" | "—";

type Check = {
  label: string;
  level: Level;
  detail: string;
  source: Source;
};

type Risk = "Low" | "Medium" | "High";

type Report = {
  address: string;
  name: string;
  symbol: string;
  score: number;
  risk: Risk;
  checks: Check[];
};

const ICON: Record<Level, string> = {
  safe: "✅",
  warn: "⚠️",
  danger: "❌",
  unknown: "❔",
};

const LEVEL_CLASS: Record<Level, string> = {
  safe: "text-primary",
  warn: "text-foreground",
  danger: "text-destructive",
  unknown: "text-muted-foreground",
};

const SOLANA_BURN_ADDRESS = "1nc1nerator11111111111111111111111111111111";

const isSolanaAddress = (v: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v.trim());

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const RISK_ORDER: Record<Risk, number> = { Low: 0, Medium: 1, High: 2 };
const maxRisk = (a: Risk, b: Risk): Risk => (RISK_ORDER[a] >= RISK_ORDER[b] ? a : b);

function buildReport(address: string, goPlus: any | null, rugCheck: any | null): Report {
  const checks: Check[] = [];
  let score = 0;

  const rcRisks: any[] = Array.isArray(rugCheck?.risks) ? rugCheck.risks : [];
  const findRisk = (re: RegExp) =>
    rcRisks.find((r) => re.test(String(r?.name ?? "")) || re.test(String(r?.description ?? "")));

  // 1. Mint authority — GoPlus primary, RugCheck fallback
  {
    const gpHas = goPlus?.mintable?.status !== undefined;
    const rcHas = rugCheck?.token !== undefined;
    if (gpHas || rcHas) {
      const source: Source = gpHas ? "GoPlus" : "RugCheck";
      const mintable = gpHas ? goPlus.mintable.status === "1" : !!rugCheck?.token?.mintAuthority;
      checks.push({
        label: "Mint authority",
        source,
        level: mintable ? "danger" : "safe",
        detail: mintable
          ? "Mint authority is still active — new tokens can be created at any time."
          : "Mint authority revoked. Supply cannot be inflated.",
      });
      if (mintable) score += 40;
    } else {
      checks.push({
        label: "Mint authority",
        source: "—",
        level: "unknown",
        detail: "Mint authority data is unavailable for this token.",
      });
      score += 5;
    }
  }

  // 2. Freeze authority — GoPlus primary, RugCheck fallback
  {
    const gpHas = goPlus?.freezable?.status !== undefined;
    const rcHas = rugCheck?.token !== undefined;
    if (gpHas || rcHas) {
      const source: Source = gpHas ? "GoPlus" : "RugCheck";
      const freezable = gpHas ? goPlus.freezable.status === "1" : !!rugCheck?.token?.freezeAuthority;
      checks.push({
        label: "Freeze authority",
        source,
        level: freezable ? "danger" : "safe",
        detail: freezable
          ? "The creator can freeze holder wallets and block selling."
          : "Freeze authority revoked. Wallets cannot be frozen.",
      });
      if (freezable) score += 40;
    } else {
      checks.push({
        label: "Freeze authority",
        source: "—",
        level: "unknown",
        detail: "Freeze authority data is unavailable for this token.",
      });
      score += 5;
    }
  }

  // 3. Liquidity locked / burned — RugCheck primary, GoPlus fallback
  {
    const markets: any[] = Array.isArray(rugCheck?.markets) ? rugCheck.markets : [];
    const lockedPcts = markets
      .map((m) => num(m?.lp?.lpLockedPct))
      .filter((n): n is number => n != null);

    if (lockedPcts.length) {
      const pct = Math.max(...lockedPcts);
      const level: Level = pct >= 90 ? "safe" : pct >= 50 ? "warn" : "danger";
      const lpRisk = findRisk(/liquidity|lp\b/i);
      checks.push({
        label: "Liquidity locked / burned",
        source: "RugCheck",
        level,
        detail: lpRisk?.description
          ? `${pct.toFixed(1)}% of the LP tokens are locked or burned. ${lpRisk.description}`
          : `${pct.toFixed(1)}% of the LP tokens are locked or burned.`,
      });
      if (level === "warn") score += 15;
      if (level === "danger") score += 30;
    } else {
      const dexList: any[] = Array.isArray(goPlus?.dex) ? goPlus.dex : [];
      const lpHolders = dexList.flatMap((d) => (Array.isArray(d?.lp_holders) ? d.lp_holders : []));
      if (lpHolders.length) {
        const lockedPct = lpHolders.reduce((acc: number, h: any) => {
          const burned =
            String(h?.address ?? "") === SOLANA_BURN_ADDRESS ||
            String(h?.tag ?? "").toLowerCase().includes("burn");
          const locked = h?.is_locked === 1 || h?.is_locked === "1" || h?.is_locked === true;
          return acc + (locked || burned ? (num(h?.percent) ?? 0) : 0);
        }, 0);
        const pct = Math.round(lockedPct * 100);
        const level: Level = pct >= 90 ? "safe" : pct >= 50 ? "warn" : "danger";
        checks.push({
          label: "Liquidity locked / burned",
          source: "GoPlus",
          level,
          detail: `${pct}% of the LP tokens are locked or burned.`,
        });
        if (level === "warn") score += 15;
        if (level === "danger") score += 30;
      } else {
        checks.push({
          label: "Liquidity locked / burned",
          source: "—",
          level: "unknown",
          detail: dexList.length
            ? "LP lock data is not reported for this pool."
            : "No DEX pool found yet — the token may still be on a bonding curve.",
        });
        score += 5;
      }
    }
  }

  // 4. Top 10 holder concentration — GoPlus primary, RugCheck fallback
  {
    const gpHolders: any[] = Array.isArray(goPlus?.holders) ? goPlus.holders : [];
    const rcHolders: any[] = Array.isArray(rugCheck?.topHolders) ? rugCheck.topHolders : [];
    if (gpHolders.length || rcHolders.length) {
      const useGp = gpHolders.length > 0;
      const pct = useGp
        ? gpHolders.slice(0, 10).reduce((acc: number, h: any) => acc + (num(h?.percent) ?? 0), 0) * 100
        : rcHolders.slice(0, 10).reduce((acc: number, h: any) => acc + (num(h?.pct) ?? 0), 0);
      const level: Level = pct > 50 ? "danger" : pct > 30 ? "warn" : "safe";
      checks.push({
        label: "Top 10 holder concentration",
        source: useGp ? "GoPlus" : "RugCheck",
        level,
        detail: `The 10 largest wallets hold ${pct.toFixed(1)}% of the supply.`,
      });
      if (level === "warn") score += 15;
      if (level === "danger") score += 30;
    } else {
      checks.push({
        label: "Top 10 holder concentration",
        source: "—",
        level: "unknown",
        detail: "Holder distribution is unavailable for this token.",
      });
      score += 5;
    }
  }

  // 5. Holder count — GoPlus primary, RugCheck fallback
  {
    const gpCount = num(goPlus?.holder_count);
    const rcCount = num(rugCheck?.totalHolders) ?? num(rugCheck?.holderCount);
    const holderCount = gpCount ?? rcCount;
    const source: Source = gpCount != null ? "GoPlus" : rcCount != null ? "RugCheck" : "—";
    const hcLevel: Level =
      holderCount == null ? "unknown" : holderCount >= 500 ? "safe" : holderCount >= 50 ? "warn" : "danger";
    checks.push({
      label: "Holder count",
      source,
      level: hcLevel,
      detail:
        holderCount == null
          ? "Holder count is unavailable."
          : `${holderCount.toLocaleString("en-US")} wallets currently hold this token.`,
    });
    if (hcLevel === "warn") score += 10;
    if (hcLevel === "danger") score += 20;
  }

  // 6. Honeypot / sellability — GoPlus primary, RugCheck risks fallback
  {
    const gpHas = goPlus != null;
    if (gpHas) {
      const nonTransferable = goPlus?.non_transferable === "1";
      const transferHook = Array.isArray(goPlus?.transfer_hook) && goPlus.transfer_hook.length > 0;
      checks.push({
        label: "Honeypot / sellability",
        source: "GoPlus",
        level: nonTransferable ? "danger" : transferHook ? "warn" : "safe",
        detail: nonTransferable
          ? "Token is marked non-transferable — you would not be able to sell."
          : transferHook
            ? "A transfer hook program is attached; transfers can be restricted by the creator."
            : "No transfer restrictions detected. Selling looks possible.",
      });
      if (nonTransferable) score += 40;
      else if (transferHook) score += 20;
    } else if (rcRisks.length || rugCheck) {
      const risk = findRisk(/transfer|sellable|honeypot/i);
      checks.push({
        label: "Honeypot / sellability",
        source: "RugCheck",
        level: risk ? "warn" : "safe",
        detail: risk
          ? String(risk.description || risk.name)
          : "No transfer restrictions reported. Selling looks possible.",
      });
      if (risk) score += 20;
    } else {
      checks.push({
        label: "Honeypot / sellability",
        source: "—",
        level: "unknown",
        detail: "Sellability data is unavailable for this token.",
      });
      score += 5;
    }
  }

  // Overall risk: safety-first — take the most cautious of GoPlus scoring and RugCheck score
  const goPlusRisk: Risk = score >= 60 ? "High" : score >= 25 ? "Medium" : "Low";

  let risk = goPlusRisk;
  if (rugCheck) {
    if (rugCheck?.rugged === true) {
      risk = "High";
    } else {
      const rcScore = num(rugCheck?.score_normalised) ?? num(rugCheck?.score);
      if (rcScore != null) {
        const rcRisk: Risk = rcScore >= 60 ? "High" : rcScore >= 25 ? "Medium" : "Low";
        risk = maxRisk(risk, rcRisk);
      }
    }
  }

  return {
    address,
    name: goPlus?.metadata?.name || rugCheck?.tokenMeta?.name || "Unknown token",
    symbol: goPlus?.metadata?.symbol || rugCheck?.tokenMeta?.symbol || "—",
    score,
    risk,
    checks,
  };
}

const RISK_STYLE: Record<Risk, string> = {
  Low: "border-primary text-primary",
  Medium: "border-border text-foreground",
  High: "border-destructive text-destructive",
};

async function fetchGoPlus(address: string) {
  const res = await fetch(
    `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${encodeURIComponent(address)}`,
    { headers: { accept: "application/json" } },
  );
  if (!res.ok) throw new Error("goplus bad status");
  const json: any = await res.json();
  const result = json?.result ?? {};
  const key = Object.keys(result).find((k) => k.toLowerCase() === address.toLowerCase());
  if (!key) throw new Error("goplus not found");
  return { key, data: result[key] };
}

// RugCheck.xyz public report endpoint. If it ever starts requiring auth
// (401/403), this source simply fails and the report falls back to GoPlus.
async function fetchRugCheck(address: string) {
  const res = await fetch(
    `https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(address)}/report`,
    { headers: { accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`rugcheck bad status ${res.status}`);
  return (await res.json()) as any;
}

export function RugCheck() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const run = async (rawAddress: string) => {
    const address = rawAddress.trim();
    setError(null);
    setReport(null);

    if (!isSolanaAddress(address)) {
      setError("That doesn't look like a valid Solana contract address. Double-check and try again.");
      return;
    }

    setLoading(true);
    try {
      const [gpResult, rcResult] = await Promise.allSettled([
        fetchGoPlus(address),
        fetchRugCheck(address),
      ]);

      const goPlusData = gpResult.status === "fulfilled" ? gpResult.value.data : null;
      const rugCheckData = rcResult.status === "fulfilled" ? rcResult.value : null;

      if (!goPlusData && !rugCheckData) {
        setError("Couldn't reach the security APIs right now. Please try again in a moment.");
        return;
      }

      const resolved = gpResult.status === "fulfilled" ? gpResult.value.key : address;
      setReport(buildReport(resolved, goPlusData, rugCheckData));
      setHistory((prev) => [address, ...prev.filter((a) => a !== address)].slice(0, 5));
    } catch {
      setError("Couldn't reach the security APIs right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rug-check" className="border-b border-border bg-card/30">
      <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
        <h2 className="text-3xl sm:text-4xl">Rug Check</h2>
        <p className="mt-3 text-muted-foreground">
          Paste any Solana contract address — not just $KOPI — and the cat detective will sniff out mint
          authority, freeze authority, liquidity, holders and honeypot traps.
        </p>

        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void run(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a Solana contract address…"
            aria-label="Solana contract address"
            spellCheck={false}
            className="flex-1 rounded-full border-2 border-border bg-background px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="glow rounded-full bg-primary px-7 py-3 font-display text-primary-foreground transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Sniffing…" : "Check Now"}
          </button>
        </form>

        {history.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Recent:</span>
            {history.map((h) => (
              <button
                key={h}
                onClick={() => {
                  setInput(h);
                  void run(h);
                }}
                className="rounded-full bg-secondary px-3 py-1 font-mono text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {h.slice(0, 4)}…{h.slice(-4)}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="pop-card mt-8 flex items-center gap-4 p-6">
            <img src={mascot} alt="" width={64} height={64} className="wiggle h-14 w-14" />
            <p className="text-sm text-muted-foreground">Cat detective is inspecting the chain…</p>
          </div>
        )}

        {error && !loading && (
          <div className="pop-card mt-8 flex items-center gap-4 p-6">
            <span className="text-2xl" aria-hidden>
              🙀
            </span>
            <p className="text-sm text-foreground">{error}</p>
          </div>
        )}

        {report && !loading && (
          <div className="mt-8 space-y-4">
            <div className="pop-card flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-display text-xl">
                  {report.name} <span className="text-primary">${report.symbol}</span>
                </p>
                <code className="break-all text-xs text-muted-foreground">{report.address}</code>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={mascot}
                  alt=""
                  width={56}
                  height={56}
                  className={`h-12 w-12 ${report.risk === "High" ? "opacity-60 grayscale" : ""}`}
                />
                <span
                  className={`rounded-full border-2 px-5 py-2 font-display text-sm ${RISK_STYLE[report.risk]}`}
                >
                  {report.risk} risk
                </span>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {report.checks.map((c) => (
                <li key={c.label} className="pop-card p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`flex items-center gap-2 text-sm font-semibold ${LEVEL_CLASS[c.level]}`}>
                      <span aria-hidden>{ICON[c.level]}</span>
                      {c.label}
                    </p>
                    {c.source !== "—" && (
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                        {c.source}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{c.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          This is not financial advice. Data is fetched automatically from GoPlus Security and RugCheck.xyz —
          always DYOR (Do Your Own Research) before buying.
        </p>
      </div>
    </section>
  );
}
