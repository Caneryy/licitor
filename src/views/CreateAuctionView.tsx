import { CreateAuctionForm } from "../components/auction/CreateAuctionForm";

interface CreateAuctionViewProps {
  onCreated: (auctionId: number) => void;
}

export function CreateAuctionView({ onCreated }: CreateAuctionViewProps) {
  return <CreateAuctionForm onCreated={onCreated} />;
}
