import { CheckCircle2, AlertCircle, X } from "lucide-react";
export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      className={`toast ${toast.type === "error" ? "toast-error" : ""}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <Icon size={21} />
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}
