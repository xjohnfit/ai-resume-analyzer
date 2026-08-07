import { Form, redirect, useActionData, useNavigation } from "react-router";
import { Sparkles } from "lucide-react";
import type { Route } from "./+types/applications.new";
import Navbar from "~/components/Navbar";
import MobileNavbar from "~/components/MobileNavbar";
import AnalyzingModal from "~/components/AnalyzingModal";
import { apiFetchWithAuthRetry } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return { user };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const payload = {
        companyName: String(formData.get("companyName") ?? ""),
        jobTitle: String(formData.get("jobTitle") ?? ""),
        jobDescriptionText: String(formData.get("jobDescriptionText") ?? ""),
    };

    const { response: createResponse, refreshedCookies: createCookies } = await apiFetchWithAuthRetry(
        request,
        "/api/applications",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        },
    );

    if (!createResponse.ok) {
        const body = await createResponse.json().catch(() => ({}));
        return { error: body.error ?? "Failed to create application. Please try again." };
    }

    const application: Application = await createResponse.json();

    const { response: analyzeResponse, refreshedCookies: analyzeCookies } = await apiFetchWithAuthRetry(
        request,
        `/api/applications/${application._id}/analyze`,
        { method: "POST" },
    );

    const headers = new Headers();
    for (const cookie of [...createCookies, ...analyzeCookies]) {
        headers.append("Set-Cookie", cookie);
    }

    if (!analyzeResponse.ok) {
        // The application itself was created fine — only the AI step failed (e.g. free-tier
        // limit reached, or a transient AI error). Don't lose the pasted JD: send them to the
        // detail page, where a "Retry analysis" action can pick up from here.
        const body = await analyzeResponse.json().catch(() => ({}));
        const message = body.error ?? "Analysis failed. You can retry from this application's page.";
        return redirect(`/applications/${application._id}?analyzeError=${encodeURIComponent(message)}`, { headers });
    }

    return redirect(`/applications/${application._id}`, { headers });
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "New Analysis — Applyze" }];
}

export default function NewApplication({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const isFreeTier = user.subscription.status !== "active" && user.subscription.status !== "trialing";
    const usedThisMonth = user.usage?.analysesThisMonth ?? 0;

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <MobileNavbar />
            <section className="main-section">
                <div className="page-heading">
                    <h1>Start a new analysis</h1>
                    <p className="max-w-2xl text-dark-200">
                        Paste the job description below. We'll score your fit against it and generate a resume
                        tailored to this specific job — built only from what's actually in your profile.
                    </p>
                    {isFreeTier && (
                        <p className="text-sm text-dark-200">
                            {usedThisMonth} of 3 free analyses used this month.
                        </p>
                    )}
                </div>

                <div className="w-full max-w-300 mx-auto">
                    {actionData?.error && (
                        <p className="mb-4 rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">
                            {actionData.error}
                        </p>
                    )}

                    <Form method="post" className="flex flex-col gap-4">
                        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="form-div">
                                <label htmlFor="companyName">Company</label>
                                <input id="companyName" name="companyName" type="text" required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="jobTitle">Job title</label>
                                <input id="jobTitle" name="jobTitle" type="text" required />
                            </div>
                        </div>

                        <div className="form-div">
                            <label htmlFor="jobDescriptionText">Job description</label>
                            <textarea
                                id="jobDescriptionText"
                                name="jobDescriptionText"
                                required
                                rows={16}
                                placeholder="Paste the full job posting here — the more complete it is, the better the fit score and tailoring will be."
                            />
                        </div>

                        <button className="primary-button w-fit self-center" type="submit" disabled={isSubmitting}>
                            <Sparkles className="h-4 w-4" />
                            Analyze & Tailor Resume
                        </button>
                    </Form>
                </div>
            </section>

            <AnalyzingModal active={isSubmitting} />
        </main>
    );
}
