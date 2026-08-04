import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-sm" }: ModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-base font-semibold text-black">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer text-dark-200 hover:text-black"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
