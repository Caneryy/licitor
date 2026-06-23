interface InfoBannerProps {
  message: string;
}

export function InfoBanner({ message }: InfoBannerProps) {
  if (!message) return null;

  return (
    <div className="info-banner" role="status">
      <span className="info-banner-icon" aria-hidden="true">
        i
      </span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
