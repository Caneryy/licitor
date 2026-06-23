interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      className="neo-card border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="font-bold">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
