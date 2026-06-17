type StatusBannerProps = {
  message?: string;
  tone?: "idle" | "success" | "error" | "info";
};

export function StatusBanner({ message, tone = "idle" }: StatusBannerProps) {
  if (!message) {
    return null;
  }

  return <p className={`statusBanner ${tone}`}>{message}</p>;
}
