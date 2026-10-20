import { AlertCircle, Heart, SearchX, RefreshCw } from "lucide-react";

export default function StatePanel({
  type = "empty",
  title,
  description,
  action,
  actionLabel,
}) {
  const Icon =
    type === "error" ? AlertCircle : type === "saved" ? Heart : SearchX;
  return (
    <div
      className={`state-panel state-panel--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span className="state-icon">
        <Icon size={30} strokeWidth={1.8} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button
          className="button button-outline"
          onClick={action}
          type="button"
        >
          {type === "error" && <RefreshCw size={16} />} {actionLabel}
        </button>
      )}
    </div>
  );
}
