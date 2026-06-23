import type { LegalPage } from "./legal";

export type { LegalPage };

export type AppRoute =
  | { view: "home" }
  | { view: "auctions" }
  | { view: "create" }
  | { view: "detail"; auctionId: number }
  | { view: "legal"; page: LegalPage };

const LEGAL_PATHS: Record<LegalPage, string> = {
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
};

export function parsePath(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") {
    return { view: "home" };
  }

  if (path === "/auctions") {
    return { view: "auctions" };
  }

  if (path === "/create") {
    return { view: "create" };
  }

  if (path === "/privacy") {
    return { view: "legal", page: "privacy" };
  }

  if (path === "/terms") {
    return { view: "legal", page: "terms" };
  }

  if (path === "/cookies") {
    return { view: "legal", page: "cookies" };
  }

  const match = path.match(/^\/auction\/(\d+)$/);
  if (match) {
    const auctionId = Number(match[1]);
    if (Number.isInteger(auctionId) && auctionId > 0) {
      return { view: "detail", auctionId };
    }
  }

  return { view: "home" };
}

export function pathForRoute(route: AppRoute): string {
  switch (route.view) {
    case "home":
      return "/";
    case "auctions":
      return "/auctions";
    case "create":
      return "/create";
    case "detail":
      return `/auction/${route.auctionId}`;
    case "legal":
      return LEGAL_PATHS[route.page];
  }
}

export function navigateTo(route: AppRoute, options?: { replace?: boolean }) {
  const path = pathForRoute(route);
  if (window.location.pathname === path) return;

  if (options?.replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }
}

export function auctionUrl(auctionId: number): string {
  return new URL(pathForRoute({ view: "detail", auctionId }), window.location.origin).href;
}

export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
