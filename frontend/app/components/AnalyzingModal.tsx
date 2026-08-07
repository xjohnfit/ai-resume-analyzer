import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AnalyzingModalProps {
    active: boolean;
    title?: string;
    description?: string;
    warning?: string;
}

export default function AnalyzingModal({
    active,
    title = "Analyzing your fit…",
    description = "This can take up to a minute — AI is scoring your fit and tailoring a resume to this job description.",
    warning = "Please don't refresh or close this page. It's safe to leave running if you do, but you'll miss the automatic update, and re-submitting would start a second, separately-counted analysis.",
}: AnalyzingModalProps) {
    // Refreshing/closing doesn't corrupt anything — the server keeps the request running to
    // completion regardless — but it does mean missing the automatic update. A native
    // confirm-before-leaving prompt is the honest backstop for that, not a claim that leaving
    // breaks something.
    useEffect(() => {
        if (!active) return;

        function handleBeforeUnload(event: BeforeUnloadEvent) {
            event.preventDefault();
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [active]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-xl">
                <Loader2 className="h-8 w-8 animate-spin text-[#606beb]" />
                <h3 className="text-base font-semibold text-black">{title}</h3>
                <p className="text-sm text-dark-200">{description}</p>
                <p className="text-xs text-dark-200">{warning}</p>
            </div>
        </div>
    );
}
