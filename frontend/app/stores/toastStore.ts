import { create } from "zustand";

export type ToastVariant = "success" | "error";

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, variant?: ToastVariant) => void;
    removeToast: (id: string) => void;
}

const TOAST_DURATION_MS = 4000;

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (message, variant = "success") => {
        const id = crypto.randomUUID();
        set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
        }, TOAST_DURATION_MS);
    },
    removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
