import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({ icon, title, message, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      {icon && <div className="mb-6 text-gold/60">{icon}</div>}
      <h2 className="font-display text-3xl text-ink-primary">{title}</h2>
      {message && <p className="mt-3 max-w-md text-sm text-ink-secondary">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-outline-gold mt-8">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
