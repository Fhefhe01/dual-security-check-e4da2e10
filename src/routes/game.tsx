import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import mascot from "@/assets/mascot.png";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "$KOPICAT Clicker — Brew Beans, Upgrade, Repeat" },
      {
        name: "description",
        content:
          "Play the $KOPICAT Clicker: tap the coffee cat to earn beans, unlock Extra Shot, Auto-Brewer and Rocket Grinder upgrades. Progress saves in your browser.",
      },
      { property: "og:title", content: "$KOPICAT Clicker — Brew Beans, Upgrade, Repeat" },
      {
        property: "og:description",
        content: "Tap the cat, earn beans, buy upgrades. A free browser clicker game for the $KOPICAT community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamePage,
});

const STORAGE_KEY = "kopicat_clicker";

type SaveState = {
  beans: number;
  perClick: number;
  perSec: number;
  costClick: number;
  costAuto: number;
  costRocket: number;
};

const DEFAULTS: SaveState = {
  beans: 0,
  perClick: 1,
  perSec: 0,
  costClick: 10,
  costAuto: 25,
  costRocket: 150,
};

type Floater = { id: number; x: number; y: number; text: string };

function GamePage() {
  const [state, setState] = useState<SaveState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const floatId = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<SaveState>) });
    } catch {
      /* ignore corrupt save */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  // idle income: +perSec/10 every 100ms
  useEffect(() => {
    if (!hydrated || state.perSec <= 0) return;
    const t = setInterval(() => {
      setState((s) => ({ ...s, beans: s.beans + s.perSec / 10 }));
    }, 100);
    return () => clearInterval(t);
  }, [hydrated, state.perSec]);

  const addFloater = useCallback((x: number, y: number, text: string) => {
    const id = ++floatId.current;
    setFloaters((f) => [...f, { id, x, y, text }]);
    setTimeout(() => setFloaters((f) => f.filter((i) => i.id !== id)), 900);
  }, []);

  const click = (e: React.MouseEvent<HTMLButtonElement>) => {
    addFloater(e.clientX - 10, e.clientY - 20, `+${state.perClick}`);
    setState((s) => ({ ...s, beans: s.beans + s.perClick }));
  };

  const buy = (kind: "click" | "auto" | "rocket") => {
    setState((s) => {
      if (kind === "click" && s.beans >= s.costClick)
        return {
          ...s,
          beans: s.beans - s.costClick,
          perClick: s.perClick + 1,
          costClick: Math.floor(s.costClick * 1.6),
        };
      if (kind === "auto" && s.beans >= s.costAuto)
        return { ...s, beans: s.beans - s.costAuto, perSec: s.perSec + 1, costAuto: Math.floor(s.costAuto * 1.8) };
      if (kind === "rocket" && s.beans >= s.costRocket)
        return { ...s, beans: s.beans - s.costRocket, perSec: s.perSec + 5, costRocket: Math.floor(s.costRocket * 1.9) };
      return s;
    });
  };

  const reset = () => {
    if (!confirm("Reset all your Kopicat Clicker progress?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState(DEFAULTS);
    setFloaters([]);
  };

  const upgrades: { key: "click" | "auto" | "rocket"; name: string; desc: string; cost: number }[] = [
    { key: "click", name: "☕ Extra Shot", desc: "+1 bean per click", cost: state.costClick },
    { key: "auto", name: "🤖 Auto-Brewer", desc: "+1 bean per second", cost: state.costAuto },
    { key: "rocket", name: "🚀 Rocket Grinder", desc: "+5 beans per second", cost: state.costRocket },
  ];

  return (
    <div className="hero-bg flex min-h-screen flex-col items-center px-4 pb-16 pt-6 text-foreground">
      <h1 className="mt-2 font-display text-3xl tracking-wide text-primary sm:text-4xl">$KOPICAT CLICKER</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        brewed slow • traded fast • never sleeps
      </p>

      <div className="mt-5 rounded-full border-2 border-primary bg-card/60 px-6 py-2.5 font-display text-xl">
        ☕ <span className="text-primary">{Math.floor(state.beans).toLocaleString("en-US")}</span> beans
      </div>

      <button
        onClick={click}
        aria-label="Click the cat to earn beans"
        className="mt-6 rounded-full transition-transform active:scale-90"
      >
        <img
          src={mascot}
          alt="$KOPICAT mascot: an orange cat with sunglasses holding coffee"
          width={512}
          height={512}
          className="h-52 w-52 rounded-full border-4 border-primary bg-card object-cover drop-shadow-2xl sm:h-56 sm:w-56"
        />
      </button>

      <p className="mt-3 text-sm text-muted-foreground">
        per click: <span className="font-display text-foreground">{state.perClick}</span> · per sec:{" "}
        <span className="font-display text-foreground">{state.perSec}</span>
      </p>

      <section className="mt-8 w-full max-w-md">
        <h2 className="border-b border-border pb-2 text-lg text-primary">Upgrades</h2>
        <div className="mt-4 space-y-3">
          {upgrades.map((u) => (
            <div key={u.key} className="pop-card flex items-center justify-between gap-4 p-4">
              <div>
                <b className="block text-primary">{u.name}</b>
                <small className="text-muted-foreground">{u.desc}</small>
              </div>
              <button
                onClick={() => buy(u.key)}
                disabled={state.beans < u.cost}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:hover:scale-100"
              >
                Buy ({u.cost})
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={reset}
        className="mt-6 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Reset progress
      </button>

      <p className="mt-6 max-w-md text-center text-xs text-muted-foreground">
        $KOPICAT is a community meme project. This clicker is just for fun — no real value, no promises. ☕🐱
      </p>

      {floaters.map((f) => (
        <span
          key={f.id}
          className="float-up pointer-events-none fixed font-display text-lg text-primary"
          style={{ left: f.x, top: f.y }}
        >
          {f.text}
        </span>
      ))}
    </div>
  );
}
