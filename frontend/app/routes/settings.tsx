import { useEffect, useState } from "react";
import { redirect, useFetcher, useSearchParams } from "react-router";
import {
    User,
    ShieldCheck,
    KeyRound,
    Trash2,
    CreditCard,
    RefreshCw,
    ArrowRightLeft,
    XCircle,
    ChevronDown,
} from "lucide-react";
import type { Route } from "./+types/settings";
import Navbar from "~/components/Navbar";
import MobileNavbar from "~/components/MobileNavbar";
import Modal from "~/components/Modal";
import { requireUser } from "~/lib/session.server";
import { apiFetch } from "~/lib/api.server";
import { useToastStore } from "~/stores/toastStore";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return { user };
}

const ENDPOINT_BY_INTENT: Record<string, string> = {
    portal: "/api/billing/portal",
    checkout: "/api/billing/checkout",
    cancel: "/api/billing/cancel",
    reactivate: "/api/billing/reactivate",
    "change-plan": "/api/billing/change-plan",
    "resend-verification": "/api/auth/resend-verification",
    "mfa-phone-start": "/api/auth/mfa/phone/start",
    "mfa-phone-confirm": "/api/auth/mfa/phone/confirm",
    "mfa-enable": "/api/auth/mfa/enable",
    "mfa-disable": "/api/auth/mfa/disable",
};

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = String(formData.get("intent") ?? "");

    if (intent === "delete-account") {
        const response = await apiFetch(request, "/api/auth/me", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: String(formData.get("password") ?? "") }),
        });

        const result = await response.json();

        if (!response.ok) {
            const message = typeof result.error === "string" ? result.error : "Something went wrong. Please try again.";
            return { error: message, intent };
        }

        const headers = new Headers();
        for (const cookie of response.headers.getSetCookie()) {
            headers.append("Set-Cookie", cookie);
        }
        return redirect("/", { headers });
    }

    const endpoint = ENDPOINT_BY_INTENT[intent];

    if (!endpoint) {
        return { error: "Unknown action." };
    }

    const body =
        intent === "change-plan" || intent === "checkout"
            ? { plan: String(formData.get("plan") ?? "") }
            : intent === "mfa-phone-start"
                ? { phoneNumber: String(formData.get("phoneNumber") ?? "") }
                : intent === "mfa-phone-confirm"
                    ? { code: String(formData.get("code") ?? "") }
                    : undefined;


    const response = await apiFetch(request, endpoint, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
        const message = typeof result.error === "string" ? result.error : "Something went wrong. Please try again.";
        return { error: message, intent };
    }

    if (intent === "portal" || intent === "checkout") {
        return redirect(result.url);
    }

    return { success: true, intent };
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Settings — Applyze" }];
}

const sections = [
    { key: "account", label: "Account", icon: User, panelBg: "bg-blue-100" },
    { key: "billing", label: "Billing", icon: CreditCard, panelBg: "bg-sky-100" },
    { key: "security", label: "Security", icon: ShieldCheck, panelBg: "bg-violet-100" },
    { key: "danger", label: "Danger zone", icon: Trash2, panelBg: "bg-red-100" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

const planLabels: Record<string, string> = {
    free: "Free",
    monthly: "Pro — Monthly",
    yearly: "Pro — Yearly",
};

const statusLabels: Record<string, string> = {
    active: "Active",
    trialing: "Trial",
    past_due: "Past due",
    canceled: "Canceled",
    incomplete: "Incomplete",
    incomplete_expired: "Expired",
    unpaid: "Unpaid",
    paused: "Paused",
    none: "No subscription",
};

const statusBadgeClasses: Record<string, string> = {
    active: "bg-green-50 text-green-700 border border-green-200",
    trialing: "bg-green-50 text-green-700 border border-green-200",
    past_due: "bg-red-50 text-red-700 border border-red-200",
    canceled: "bg-gray-100 text-gray-600 border border-gray-200",
    incomplete: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    incomplete_expired: "bg-gray-100 text-gray-600 border border-gray-200",
    unpaid: "bg-red-50 text-red-700 border border-red-200",
    paused: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    none: "bg-gray-100 text-gray-600 border border-gray-200",
};

const statusDotClasses: Record<string, string> = {
    active: "bg-green-500",
    trialing: "bg-green-500",
    past_due: "bg-red-500",
    canceled: "bg-gray-400",
    incomplete: "bg-yellow-500",
    incomplete_expired: "bg-gray-400",
    unpaid: "bg-red-500",
    paused: "bg-yellow-500",
    none: "bg-gray-400",
};

function formatDate(value?: string) {
    if (!value) return null;
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function maskPhone(phone?: string) {
    if (!phone) return "";
    return `••••${phone.slice(-4)}`;
}

const countryCodes = [
    { flag: "🇺🇸", code: "+1", label: "United States" },
    { flag: "🇨🇦", code: "+1", label: "Canada" },
    { flag: "🇬🇧", code: "+44", label: "United Kingdom" },
    { flag: "🇦🇺", code: "+61", label: "Australia" },
    { flag: "🇩🇪", code: "+49", label: "Germany" },
    { flag: "🇫🇷", code: "+33", label: "France" },
    { flag: "🇪🇸", code: "+34", label: "Spain" },
    { flag: "🇮🇹", code: "+39", label: "Italy" },
    { flag: "🇧🇷", code: "+55", label: "Brazil" },
    { flag: "🇲🇽", code: "+52", label: "Mexico" },
    { flag: "🇮🇳", code: "+91", label: "India" },
    { flag: "🇯🇵", code: "+81", label: "Japan" },
];

export default function Settings({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;
    const [searchParams] = useSearchParams();
    const initialSection: SectionKey = searchParams.get("section") === "billing" ? "billing" : "account";
    const [activeSection, setActiveSection] = useState<SectionKey>(initialSection);
    const activePanelBg = sections.find((section) => section.key === activeSection)?.panelBg ?? "bg-blue-100";

    const { plan, status, currentPeriodEnd, cancelAtPeriodEnd } = user.subscription;
    const { analysesThisMonth } = user.usage;
    const isPaid = plan === "monthly" || plan === "yearly";
    const hasUnlimitedAnalyses = status === "active" || status === "trialing";
    const otherPlan = plan === "monthly" ? "yearly" : "monthly";
    const otherPlanPrice = otherPlan === "monthly" ? "$9/mo" : "$79/yr";
    const periodEndLabel = formatDate(currentPeriodEnd);

    const [activeModal, setActiveModal] = useState<"upgrade" | "cancel" | "change-plan" | "delete-account" | null>(null);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
    const [phoneLocalNumber, setPhoneLocalNumber] = useState("");
    const [retryCountryCode, setRetryCountryCode] = useState("+1");
    const [retryLocalNumber, setRetryLocalNumber] = useState("");

    const fetcher = useFetcher<typeof action>();
    const addToast = useToastStore((state) => state.addToast);
    const isBusy = fetcher.state !== "idle";

    useEffect(() => {
        if (!fetcher.data || fetcher.state !== "idle") return;

        if (fetcher.data.success) {
            const messages: Record<string, string> = {
                cancel: "Your subscription will end at the end of the current period.",
                reactivate: "Your subscription has been reactivated.",
                "change-plan": "Your plan has been updated.",
                "resend-verification": "Verification email sent — check your inbox.",
                "mfa-phone-start": "Verification code sent.",
                "mfa-phone-confirm": "Phone number verified.",
                "mfa-enable": "Two-factor authentication enabled.",
                "mfa-disable": "Two-factor authentication disabled.",
            };
            addToast(messages[fetcher.data.intent as string] ?? "Done.", "success");
            setActiveModal(null);
        } else if (fetcher.data.error) {
            addToast(fetcher.data.error, "error");
        }
    }, [fetcher.data, fetcher.state, addToast]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <MobileNavbar />
            <section className="main-section items-stretch gap-6 pt-6 pb-10">
                <div className="mx-auto w-full max-w-300">
                    <h1 className="text-2xl font-semibold text-black tracking-wide">Settings</h1>
                    <p className="text-sm text-dark-200">Manage your account, security, and billing.</p>
                </div>

                <div className="mx-auto flex w-full max-w-300 flex-col gap-6 lg:flex-row lg:items-start">
                    <aside className="flex shrink-0 flex-row gap-1 overflow-x-auto rounded-2xl bg-indigo-50 p-2 lg:h-fit lg:w-52 lg:flex-col lg:overflow-visible">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.key;
                            return (
                                <button
                                    key={section.key}
                                    type="button"
                                    onClick={() => setActiveSection(section.key)}
                                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                        ? "bg-[#606beb] text-white"
                                        : "text-dark-200 hover:bg-white/70 hover:text-black"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {section.label}
                                </button>
                            );
                        })}
                    </aside>

                    <div className={`min-w-0 flex-1 rounded-2xl border border-black/5 p-6 transition-colors ${activePanelBg}`}>
                        {activeSection === "account" && (
                            <div className="flex flex-col gap-4">
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
                                    <User className="h-4 w-4 text-[#606beb]" />
                                    Account
                                </h2>
                                <div className="flex flex-col divide-y divide-black/10 text-sm">
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-dark-200">Name</span>
                                        <span className="font-medium text-black">{user.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-dark-200">Email</span>
                                        <span className="font-medium text-black">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "billing" && (
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
                                        <CreditCard className="h-4 w-4 text-[#606beb]" />
                                        {planLabels[plan] ?? plan}
                                    </h2>
                                    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${statusBadgeClasses[status] ?? statusBadgeClasses.none}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotClasses[status] ?? statusDotClasses.none}`} />
                                        {statusLabels[status] ?? status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 text-sm text-dark-200">
                                    {isPaid && periodEndLabel && (
                                        <p>
                                            {cancelAtPeriodEnd
                                                ? `Your plan ends on ${periodEndLabel} — you'll drop to the Free tier after that.`
                                                : `Renews on ${periodEndLabel}.`}
                                        </p>
                                    )}
                                    <p>
                                        {hasUnlimitedAnalyses
                                            ? "Unlimited AI analyses."
                                            : `${analysesThisMonth}/3 AI analyses used this month.`}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {!isPaid && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveModal("upgrade")}
                                            className="primary-button w-fit px-4 py-2 text-xs"
                                        >
                                            Upgrade
                                        </button>
                                    )}

                                    {isPaid && !cancelAtPeriodEnd && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setActiveModal("change-plan")}
                                                className="secondary-button w-fit border-blue-200 bg-blue-50 px-3 py-1.5 text-xs hover:border-blue-300 hover:bg-blue-100"
                                            >
                                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                                Switch to {otherPlan === "monthly" ? "Monthly" : "Yearly"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveModal("cancel")}
                                                className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-red-700"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Cancel subscription
                                            </button>
                                        </>
                                    )}

                                    {isPaid && cancelAtPeriodEnd && (
                                        <fetcher.Form method="post">
                                            <input type="hidden" name="intent" value="reactivate" />
                                            <button
                                                type="submit"
                                                disabled={isBusy}
                                                className="secondary-button w-fit border-blue-200 bg-blue-50 px-3 py-1.5 text-xs hover:border-blue-300 hover:bg-blue-100"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                {isBusy ? "Reactivating..." : "Reactivate subscription"}
                                            </button>
                                        </fetcher.Form>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 border-t border-black/10 pt-4">
                                    <p className="text-sm font-medium text-black">Payment method &amp; invoices</p>
                                    <p className="text-sm text-dark-200">Update your card or download past invoices via Stripe.</p>
                                    <fetcher.Form method="post">
                                        <input type="hidden" name="intent" value="portal" />
                                        <button type="submit" disabled={isBusy} className="secondary-button mt-1 w-fit border-blue-200 bg-blue-50 px-3 py-1.5 text-xs hover:border-blue-300 hover:bg-blue-100">
                                            Manage payment method
                                        </button>
                                    </fetcher.Form>
                                </div>
                            </div>
                        )}

                        {activeSection === "security" && (
                            <div className="flex flex-col gap-6">
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
                                    <ShieldCheck className="h-4 w-4 text-[#606beb]" />
                                    Security
                                </h2>

                                <div className="flex flex-col gap-2 border-b border-black/10 pb-6">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="flex items-center gap-2 text-sm font-medium text-black">
                                            <ShieldCheck className="h-4 w-4 text-[#606beb]" />
                                            Email verification
                                        </p>
                                        {user.emailVerified ? (
                                            <span className="w-fit rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="w-fit rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                                                Not verified
                                            </span>
                                        )}
                                    </div>
                                    {user.emailVerified ? (
                                        <p className="text-sm text-dark-200">Your email address is verified.</p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-dark-200">Verify your email address to secure your account.</p>
                                            <fetcher.Form method="post">
                                                <input type="hidden" name="intent" value="resend-verification" />
                                                <button
                                                    type="submit"
                                                    disabled={isBusy}
                                                    className="secondary-button w-fit border-blue-200 bg-blue-50 px-3 py-1.5 text-xs hover:border-blue-300 hover:bg-blue-100"
                                                >
                                                    {isBusy ? "Sending..." : "Resend verification email"}
                                                </button>
                                            </fetcher.Form>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="flex items-center gap-2 text-sm font-medium text-black">
                                            <KeyRound className="h-4 w-4 text-[#606beb]" />
                                            Two-factor authentication
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${user.mfa.enabled ? "text-green-700" : "text-gray-500"}`}>
                                                {user.mfa.enabled ? "Enabled" : "Disabled"}
                                            </span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={user.mfa.enabled}
                                                aria-label="Toggle two-factor authentication"
                                                disabled={isBusy || !user.mfa.phoneVerified}
                                                onClick={() =>
                                                    fetcher.submit(
                                                        { intent: user.mfa.enabled ? "mfa-disable" : "mfa-enable" },
                                                        { method: "post" },
                                                    )
                                                }
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${user.mfa.enabled ? "bg-green-500" : "bg-gray-300"
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${user.mfa.enabled ? "translate-x-6" : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {user.mfa.enabled ? (
                                        <p className="text-sm text-dark-200">
                                            A code is sent to {maskPhone(user.mfa.phoneNumber)} each time you log in.
                                        </p>
                                    ) : user.mfa.phoneVerified ? (
                                        <p className="text-sm text-dark-200">
                                            {maskPhone(user.mfa.phoneNumber)} is verified. Turn on two-factor authentication to require a code at every login.
                                        </p>
                                    ) : user.mfa.phoneNumber ? (
                                        <>
                                            <p className="text-sm text-dark-200">
                                                We sent a code to {maskPhone(user.mfa.phoneNumber)}. Enter it below to confirm this number.
                                            </p>
                                            <fetcher.Form method="post" className="flex flex-row flex-nowrap items-center gap-2">
                                                <input
                                                    id="mfaCode"
                                                    name="code"
                                                    type="text"
                                                    inputMode="numeric"
                                                    aria-label="Code"
                                                    required
                                                    className="w-20 shrink-0 p-2 text-center text-sm tracking-wider"
                                                />
                                                <input type="hidden" name="intent" value="mfa-phone-confirm" />
                                                <button
                                                    type="submit"
                                                    disabled={isBusy}
                                                    className="secondary-button mt-1 w-fit border-blue-200 bg-blue-50 px-3 py-1.5 text-xs hover:border-blue-300 hover:bg-blue-100"
                                                >
                                                    {isBusy ? "Verifying..." : "Verify code"}
                                                </button>
                                            </fetcher.Form>
                                            <p className="text-xs text-dark-200">Wrong number?</p>
                                            <fetcher.Form method="post" className="flex flex-row flex-nowrap items-center gap-2">
                                                <div className="relative shrink-0">
                                                    <select
                                                        value={retryCountryCode}
                                                        onChange={(e) => setRetryCountryCode(e.target.value)}
                                                        aria-label="Country code"
                                                        className="inset-shadow w-fit appearance-none rounded-2xl bg-white py-2 pr-6 pl-2 text-sm focus:outline-none"
                                                    >
                                                        {countryCodes.map((c) => (
                                                            <option key={`${c.label}-${c.code}`} value={c.code}>
                                                                {c.flag} {c.code}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3.5 w-3.5 -translate-y-1/2 text-dark-200" />
                                                </div>
                                                <input
                                                    value={retryLocalNumber}
                                                    onChange={(e) => setRetryLocalNumber(e.target.value)}
                                                    type="tel"
                                                    placeholder="5551234567"
                                                    aria-label="New phone number"
                                                    required
                                                    className="ml-1 w-32 shrink-0 p-2 text-sm tracking-wider"
                                                />
                                                <input type="hidden" name="phoneNumber" value={`${retryCountryCode}${retryLocalNumber.replace(/\D/g, "")}`} />
                                                <input type="hidden" name="intent" value="mfa-phone-start" />
                                                <button
                                                    type="submit"
                                                    disabled={isBusy}
                                                    className="secondary-button mt-1 w-fit border-blue-200 bg-blue-50 px-3 py-1.5 text-xs hover:border-blue-300 hover:bg-blue-100"
                                                >
                                                    {isBusy ? "Sending..." : "Send to new number"}
                                                </button>
                                            </fetcher.Form>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-dark-200">Add a phone number to require a code at login.</p>
                                            <fetcher.Form method="post" className="flex flex-row flex-nowrap items-center gap-2">
                                                <div className="relative shrink-0">
                                                    <select
                                                        value={phoneCountryCode}
                                                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                                                        aria-label="Country code"
                                                        className="inset-shadow w-fit appearance-none rounded-2xl bg-white py-2 pr-6 pl-2 text-sm focus:outline-none"
                                                    >
                                                        {countryCodes.map((c) => (
                                                            <option key={`${c.label}-${c.code}`} value={c.code}>
                                                                {c.flag} {c.code}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3.5 w-3.5 -translate-y-1/2 text-dark-200" />
                                                </div>
                                                <input
                                                    value={phoneLocalNumber}
                                                    onChange={(e) => setPhoneLocalNumber(e.target.value)}
                                                    type="tel"
                                                    placeholder="5551234567"
                                                    aria-label="Phone number"
                                                    required
                                                    className="ml-1 w-32 shrink-0 p-2 text-sm tracking-wider"
                                                />
                                                <input type="hidden" name="phoneNumber" value={`${phoneCountryCode}${phoneLocalNumber.replace(/\D/g, "")}`} />
                                                <input type="hidden" name="intent" value="mfa-phone-start" />
                                                <button
                                                    type="submit"
                                                    disabled={isBusy}
                                                    className="secondary-button mt-1 w-fit border-blue-200 bg-blue-50 px-3 py-1.5 text-xs whitespace-nowrap hover:border-blue-300 hover:bg-blue-100"
                                                >
                                                    {isBusy ? "Sending..." : "Send code"}
                                                </button>
                                            </fetcher.Form>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === "danger" && (
                            <div className="flex flex-col gap-4">
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-badge-red-text">
                                    <Trash2 className="h-4 w-4" />
                                    Delete account
                                </h2>
                                <p className="text-sm text-dark-200">
                                    Permanently delete your account and all associated data, including your profile.
                                    This cannot be undone.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveModal("delete-account")}
                                    className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-red-700"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete account
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </section>

            <Modal
                open={activeModal === "upgrade"}
                onClose={() => setActiveModal(null)}
                title="Choose your plan"
                maxWidth="max-w-lg"
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 text-center">
                        <p className="text-sm font-semibold text-black">Monthly</p>
                        <p className="text-2xl font-semibold text-black">
                            $9<span className="text-sm font-normal text-dark-200">/mo</span>
                        </p>
                        <p className="text-xs text-dark-200">Unlimited AI analyses, billed monthly. Cancel anytime.</p>
                        <fetcher.Form method="post" className="mt-2">
                            <input type="hidden" name="intent" value="checkout" />
                            <input type="hidden" name="plan" value="monthly" />
                            <button type="submit" disabled={isBusy} className="primary-button w-full px-3 py-1.5 text-xs">
                                {isBusy ? "Redirecting..." : "Choose Monthly"}
                            </button>
                        </fetcher.Form>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl border border-[#606beb] p-4 text-center">
                        <p className="text-sm font-semibold text-black">Yearly</p>
                        <p className="text-2xl font-semibold text-black">
                            $79<span className="text-sm font-normal text-dark-200">/yr</span>
                        </p>
                        <p className="text-xs text-dark-200">Unlimited AI analyses, billed yearly. Save ~27% vs. monthly.</p>
                        <fetcher.Form method="post" className="mt-2">
                            <input type="hidden" name="intent" value="checkout" />
                            <input type="hidden" name="plan" value="yearly" />
                            <button type="submit" disabled={isBusy} className="primary-button w-full px-3 py-1.5 text-xs">
                                {isBusy ? "Redirecting..." : "Choose Yearly"}
                            </button>
                        </fetcher.Form>
                    </div>
                </div>
            </Modal>

            <Modal open={activeModal === "cancel"} onClose={() => setActiveModal(null)} title="Cancel subscription">
                <p className="mb-4 text-sm text-dark-200">
                    {periodEndLabel
                        ? `Your plan will stay active until ${periodEndLabel}. After that you'll drop to the Free tier (3 analyses/month). You can reactivate anytime before then.`
                        : "You'll drop to the Free tier (3 analyses/month) at the end of your current billing period. You can reactivate anytime before then."}
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="secondary-button w-fit px-3 py-1.5 text-xs"
                    >
                        Keep my plan
                    </button>
                    <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="cancel" />
                        <button type="submit" disabled={isBusy} className="primary-button w-fit px-3 py-1.5 text-xs">
                            {isBusy ? "Canceling..." : "Cancel subscription"}
                        </button>
                    </fetcher.Form>
                </div>
            </Modal>

            <Modal open={activeModal === "change-plan"} onClose={() => setActiveModal(null)} title="Switch plan">
                <p className="mb-4 text-sm text-dark-200">
                    Switch to {otherPlan === "monthly" ? "Monthly" : "Yearly"} billing ({otherPlanPrice}). The change applies immediately and your next invoice is prorated.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="secondary-button w-fit px-3 py-1.5 text-xs"
                    >
                        Cancel
                    </button>
                    <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="change-plan" />
                        <input type="hidden" name="plan" value={otherPlan} />
                        <button type="submit" disabled={isBusy} className="primary-button w-fit px-3 py-1.5 text-xs">
                            {isBusy ? "Switching..." : `Switch to ${otherPlan === "monthly" ? "Monthly" : "Yearly"}`}
                        </button>
                    </fetcher.Form>
                </div>
            </Modal>

            <Modal
                open={activeModal === "delete-account"}
                onClose={() => {
                    setActiveModal(null);
                    setDeletePassword("");
                    setDeleteConfirmText("");
                }}
                title="Delete account"
            >
                <p className="mb-4 text-sm text-dark-200">
                    This permanently deletes your account, profile, and any active subscription. This cannot be undone.
                </p>
                <fetcher.Form method="post" className="flex flex-col gap-3">
                    <input type="hidden" name="intent" value="delete-account" />
                    <div className="form-div">
                        <label htmlFor="deletePassword">Password</label>
                        <input
                            id="deletePassword"
                            name="password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-div">
                        <label htmlFor="deleteConfirm">Type DELETE to confirm</label>
                        <input
                            id="deleteConfirm"
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveModal(null);
                                setDeletePassword("");
                                setDeleteConfirmText("");
                            }}
                            className="secondary-button w-fit px-3 py-1.5 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isBusy || deleteConfirmText !== "DELETE" || !deletePassword}
                            className="w-fit rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isBusy ? "Deleting..." : "Delete account"}
                        </button>
                    </div>
                </fetcher.Form>
            </Modal>
        </main>
    );
}
