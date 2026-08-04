import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { useToastStore } from "~/stores/toastStore";

const categories = [
    { value: "subscription", label: "Subscription & billing" },
    { value: "bug", label: "Report a bug" },
    { value: "question", label: "General question" },
    { value: "other", label: "Other" },
];

interface ContactFormProps {
    idPrefix?: string;
}

interface ContactActionData {
    success: boolean;
    error?: string;
}

const ContactForm = ({ idPrefix = "" }: ContactFormProps) => {
    const fieldId = (base: string) => `${idPrefix}${base}`;
    const fetcher = useFetcher<ContactActionData>();
    const formRef = useRef<HTMLFormElement>(null);
    const addToast = useToastStore((state) => state.addToast);
    const isSubmitting = fetcher.state !== "idle";

    useEffect(() => {
        if (!fetcher.data || fetcher.state !== "idle") return;

        if (fetcher.data.success) {
            addToast("Message sent — we'll get back to you soon.", "success");
            formRef.current?.reset();
        } else {
            addToast(fetcher.data.error ?? "Something went wrong. Please try again.", "error");
        }
    }, [fetcher.data, fetcher.state, addToast]);

    return (
        <fetcher.Form method="post" action="/contact" ref={formRef} className="flex flex-col gap-4">
            <div className="form-div">
                <label htmlFor={fieldId("name")}>Full name</label>
                <input id={fieldId("name")} name="name" type="text" required />
            </div>
            <div className="form-div">
                <label htmlFor={fieldId("email")}>Email</label>
                <input id={fieldId("email")} name="email" type="email" required />
            </div>
            <div className="form-div">
                <label htmlFor={fieldId("category")}>What's this about?</label>
                <select
                    id={fieldId("category")}
                    name="category"
                    required
                    defaultValue=""
                    className="inset-shadow w-full rounded-2xl bg-white p-4 focus:outline-none"
                >
                    <option value="" disabled>Select a category</option>
                    {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-div">
                <label htmlFor={fieldId("message")}>Message</label>
                <textarea id={fieldId("message")} name="message" rows={5} required />
            </div>
            <button className="auth-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send message"}
            </button>
        </fetcher.Form>
    );
};

export default ContactForm;
