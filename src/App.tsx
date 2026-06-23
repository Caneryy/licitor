import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AuctionDetailView } from "./views/AuctionDetailView";
import { AuctionListView } from "./views/AuctionListView";
import { CreateAuctionView } from "./views/CreateAuctionView";
import type { AppView } from "./lib/types";

export default function App() {
  const [view, setView] = useState<AppView>("auctions");
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

  const openAuction = (auctionId: number) => {
    setSelectedAuctionId(auctionId);
    setView("detail");
  };

  return (
    <AppShell
      view={view}
      onNavigate={(nextView) => {
        setView(nextView);
        if (nextView !== "detail") {
          setSelectedAuctionId(null);
        }
      }}
    >
      {view === "auctions" && <AuctionListView onOpen={openAuction} />}
      {view === "create" && (
        <CreateAuctionView
          onCreated={(auctionId) => {
            openAuction(auctionId);
          }}
        />
      )}
      {view === "detail" && selectedAuctionId !== null && (
        <AuctionDetailView
          auctionId={selectedAuctionId}
          onBack={() => {
            setSelectedAuctionId(null);
            setView("auctions");
          }}
        />
      )}
    </AppShell>
  );
}
