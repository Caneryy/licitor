import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { LegalShell } from "./components/layout/LegalShell";
import { AuctionDetailView } from "./views/AuctionDetailView";
import { AuctionListView } from "./views/AuctionListView";
import { CreateAuctionView } from "./views/CreateAuctionView";
import { LandingView } from "./views/LandingView";
import { LegalPageView } from "./views/LegalPageView";
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

  if (route.view === "legal") {
    return (
      <LegalShell
        onGoHome={() => goTo({ view: "home" })}
        onEnterApp={(view) => goTo({ view })}
        onLegalPage={(page) => goTo({ view: "legal", page })}
      >
        <LegalPageView page={route.page} onGoHome={() => goTo({ view: "home" })} />
      </LegalShell>
    );
  }

  if (route.view === "home") {
    return (
      <LandingView
        onEnterApp={(view) => {
          goTo({ view });
        }}
        onGoHome={() => goTo({ view: "home" })}
        onLegalPage={(page) => goTo({ view: "legal", page })}
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
