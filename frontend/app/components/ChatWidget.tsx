import { useEffect, useRef, useState } from "react";
import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X, Send, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface StoredChatMessage {
    _id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatWidget() {
    const rootData = useRouteLoaderData<typeof rootLoader>("root");
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState("");
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

    const { messages, sendMessage, status, setMessages } = useChat({
        transport: new DefaultChatTransport({ api: "/chat" }),
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Lazy-load history only once the widget is actually opened — no reason to hit
    // the DB on every page load for users who never open the chat.
    useEffect(() => {
        if (!isOpen || hasLoadedHistory) return;
        setHasLoadedHistory(true);

        fetch("/chat")
            .then((res) => res.json())
            .then((history: StoredChatMessage[]) => {
                setMessages(
                    history.map((m) => ({
                        id: m._id,
                        role: m.role,
                        parts: [{ type: "text" as const, text: m.content }],
                    })),
                );
            })
            .catch(() => {});
    }, [isOpen, hasLoadedHistory, setMessages]);

    // Jump to the latest message whenever the widget opens, history loads, or a new
    // message streams in — otherwise reopening the widget leaves you scrolled to the top.
    useEffect(() => {
        if (!isOpen) return;
        messagesEndRef.current?.scrollIntoView({ block: "end" });
    }, [isOpen, messages]);

    if (!rootData?.isAuthenticated) return null;

    const isStreaming = status === "submitted" || status === "streaming";

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;
        sendMessage({ text: input });
        setInput("");
    }

    return (
        <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3">
            {isOpen && (
                <div
                    className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition-[width,height] ${
                        isExpanded ? "h-[calc(100vh-7rem)] w-[92vw] sm:w-[50vw]" : "h-112 w-80 sm:w-96"
                    }`}
                >
                    <div className="primary-gradient flex items-center justify-between px-4 py-3 text-white">
                        <p className="text-sm font-semibold">Applyze Assistant</p>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsExpanded((prev) => !prev)}
                                aria-label={isExpanded ? "Minimize chat" : "Maximize chat"}
                            >
                                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </button>
                            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                        {messages.length === 0 && (
                            <p className="mt-4 text-center text-xs text-dark-200">
                                Ask me about your applications, your profile, or how to prep for an interview.
                            </p>
                        )}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                                    message.role === "user"
                                        ? "self-end bg-[#606beb] text-white"
                                        : "self-start bg-gray-100 text-black"
                                }`}
                            >
                                {message.parts
                                    .filter((part) => part.type === "text")
                                    .map((part, i) => (
                                        <ReactMarkdown
                                            key={i}
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                ul: ({ children }) => (
                                                    <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
                                                ),
                                                ol: ({ children }) => (
                                                    <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
                                                ),
                                            }}
                                        >
                                            {part.text}
                                        </ReactMarkdown>
                                    ))}
                            </div>
                        ))}
                        {isStreaming && (
                            <div className="self-start rounded-2xl bg-gray-100 px-3 py-2 text-sm text-dark-200">
                                Thinking…
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-row items-center gap-2 border-t border-gray-100 p-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question…"
                            className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isStreaming || !input.trim()}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#606beb] text-white disabled:opacity-50"
                            aria-label="Send"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="primary-button h-14 w-14 rounded-full shadow-lg"
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                <MessageCircle className="h-6 w-6" />
            </button>
        </div>
    );
}
