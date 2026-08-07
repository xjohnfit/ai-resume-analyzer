import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PdfPreview({ url }: { url: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const container = containerRef.current;
        if (container) container.innerHTML = "";
        setIsLoading(true);
        setError(null);

        async function render() {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to load PDF");

                const arrayBuffer = await response.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    if (cancelled) return;

                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.5 });

                    const canvas = document.createElement("canvas");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    canvas.className = "w-full max-w-full rounded-lg border border-gray-200 shadow-sm";

                    await page.render({ canvas, viewport }).promise;
                    if (!cancelled) container?.appendChild(canvas);
                }
            } catch {
                if (!cancelled) setError("Couldn't load the PDF preview.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        render();
        return () => {
            cancelled = true;
        };
    }, [url]);

    return (
        <div className="h-[75vh] w-full overflow-y-auto">
            {isLoading && <p className="py-8 text-center text-sm text-dark-200">Loading preview…</p>}
            {error && <p className="py-8 text-center text-sm text-badge-red-text">{error}</p>}
            <div ref={containerRef} className="flex flex-col items-center gap-4" />
        </div>
    );
}
