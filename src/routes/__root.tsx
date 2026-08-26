import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "$KOPICAT — Kucing Ngopi Meme Coin" },
      { name: "description", content: "Meme coin kucing paling kafein di Solana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bungee&family=Space+Grotesk:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function isImageTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "IMG" || !!target.closest("img");
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Strong image protection
  useEffect(() => {
    const block = (e: Event) => {
      if (isImageTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Capture phase so we catch the event early
    const opts: AddEventListenerOptions = { capture: true };

    document.addEventListener("contextmenu", block, opts);
    document.addEventListener("dragstart", block, opts);
    document.addEventListener("selectstart", block, opts);

    // Block common save / view-source shortcuts when focus is near images
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isSave = (e.ctrlKey || e.metaKey) && key === "s";
      const isViewSource = (e.ctrlKey || e.metaKey) && key === "u";
      if ((isSave || isViewSource) && isImageTarget(document.activeElement)) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown, opts);

    // Extra: disable image context menu attribute on all current & future imgs
    const disableImgContext = () => {
      document.querySelectorAll("img").forEach((img) => {
        img.setAttribute("oncontextmenu", "return false");
        img.setAttribute("draggable", "false");
      });
    };
    disableImgContext();

    // Observe DOM for newly added images (e.g. lazy loaded)
    const observer = new MutationObserver(() => disableImgContext());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("contextmenu", block, opts);
      document.removeEventListener("dragstart", block, opts);
      document.removeEventListener("selectstart", block, opts);
      document.removeEventListener("keydown", onKeyDown, opts);
      observer.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
