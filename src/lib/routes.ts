export type AppRoute =
  | { view: "auctions" }
  | { view: "create" }
  | { view: "detail"; auctionId: number };

export function parsePath(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/" || path === "/auctions") {
    return { view: "auctions" };
  }

  if (path === "/create") {
    return { view: "create" };
  }

  const match = path.match(/^\/auction\/(\d+)$/);
  if (match) {
    const auctionId = Number(match[1]);
    if (Number.isInteger(auctionId) && auctionId > 0) {
      return { view: "detail", auctionId };
    }
  }

  return { view: "auctions" };
}

export function pathForRoute(route: AppRoute): string {
  switch (route.view) {
    case "auctions":
      return "/auctions";
    case "create":
      return "/create";
    case "detail":
      return `/auction/${route.auctionId}`;
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
