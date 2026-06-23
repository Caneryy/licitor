import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AuctionDetailView } from "./views/AuctionDetailView";
import { AuctionListView } from "./views/AuctionListView";
import { CreateAuctionView } from "./views/CreateAuctionView";
import { LandingView } from "./views/LandingView";
import { navigateTo, parsePath, type AppRoute } from "./lib/routes";

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parsePath(window.location.pathname));

  const goTo = useCallback((next: AppRoute, options?: { replace?: boolean }) => {
    navigateTo(next, options);
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parsePath(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openAuction = useCallback(
    (auctionId: number) => {
      goTo({ view: "detail", auctionId });
    },
    [goTo],
  );

  if (route.view === "home") {
    return (
      <LandingView
        onEnterApp={(view) => {
          goTo({ view });
        }}
      />
    );
  }

  return (
    <AppShell
      view={route.view}
      onNavigate={(view) => {
        if (view === "detail") return;
        goTo({ view });
      }}
    >
      {route.view === "auctions" && (
        <AuctionListView onOpen={openAuction} onCreate={() => goTo({ view: "create" })} />
      )}
      {route.view === "create" && (
        <CreateAuctionView
          onCreated={(auctionId) => {
            goTo({ view: "detail", auctionId }, { replace: true });
          }}
        />
      )}
      {route.view === "detail" && (
        <AuctionDetailView
          auctionId={route.auctionId}
          onBack={() => goTo({ view: "auctions" })}
        />
      )}
    </AppShell>
  );
}
