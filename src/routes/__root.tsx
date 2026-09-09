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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper-alt)] px-4">
      <div className="max-w-md text-center border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-8 shadow-sm">
        <h1 className="font-serif text-6xl font-semibold text-[var(--color-ink)]">404</h1>
        <h2 className="mt-4 font-serif text-xl font-semibold text-[var(--color-ink)]">Page Not Found</h2>
        <p className="mt-2 text-sm text-[var(--color-gray)]">
          The requested clinical clinical record or view doesn't exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0c5854]"
          >
            Return to Netra Rakshak Home
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper-alt)] px-4">
      <div className="max-w-md text-center border border-[var(--color-gray-line)] bg-[var(--color-paper)] p-8 shadow-sm">
        <h1 className="font-serif text-xl font-semibold text-[var(--color-ink)]">
          Diagnostic System Error
        </h1>
        <p className="mt-2 text-sm text-[var(--color-gray)]">
          An unexpected error occurred while loading this view.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0c5854]"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-[var(--color-gray-line)] bg-[var(--color-paper)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-alt)]"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          title:
            "Netra Rakshak — Explainable AI for Diabetic Retinopathy Screening",
        },
        {
          name: "description",
          content:
            "AI-powered retinal screening platform for rural India: automated quality assessment, DR severity grading with >90% sensitivity, Grad-CAM explainability, and 30-second specialist validation.",
        },
        { name: "author", content: "Team Netra Rakshak" },
        {
          property: "og:title",
          content:
            "Netra Rakshak — Explainable AI for Diabetic Retinopathy Screening",
        },
        {
          property: "og:description",
          content:
            "Empowering rural India with explainable AI-powered diabetic retinopathy screening: instant quality triage, sub-pixel lesion detection, and rapid specialist validation.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@NetraRakshak" },
        { name: "theme-color", content: "#0F6F6A" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[var(--color-paper)] text-[var(--color-ink)] antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
