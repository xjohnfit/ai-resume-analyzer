import { X } from "lucide-react";
import { useToastStore } from "~/stores/toastStore";

export default function Toaster() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-4 rounded-xl px-6 py-4 text-base font-medium shadow-lg ${toast.variant === "error"
                            ? "bg-badge-red text-badge-red-text"
                            : "bg-badge-green text-badge-green-text"
                        }`}
                >
                    <span>{toast.message}</span>
                    <button
                        type="button"
                        onClick={() => removeToast(toast.id)}
                        className="cursor-pointer opacity-70 hover:opacity-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            ))}
        </div>
    );
}
