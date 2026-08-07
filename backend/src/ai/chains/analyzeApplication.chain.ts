import { ChatAnthropic } from '@langchain/anthropic';
import { env } from '../../config/env';
import { feedbackSchema } from '../schemas/feedback.schema';
import { resumeContentSchema } from '../schemas/resumeContent.schema';
import { buildAnalyzeAndTailorPrompt } from '../prompts/resumeFeedback.prompt';
import type { ResumeContent } from '../../models/Profile.model';

const { ANTHROPIC_API_KEY } = env;

export const CLAUDE_MODEL = 'claude-sonnet-5';

const model = new ChatAnthropic({
    apiKey: ANTHROPIC_API_KEY,
    model: CLAUDE_MODEL,
    maxTokens: 8192,
});

// Two separate structured-output calls, not one combined {feedback, tailoredResume}
// schema — the combined schema proved unreliable in practice once skills became
// categorized (deeper nesting): Claude would occasionally double-encode one half as a
// JSON *string* instead of a real nested object, failing validation, and a higher
// maxTokens didn't help (confirmed via testing — this isn't a truncation issue, it's a
// structural quirk tied to schema depth). Splitting each half into its own shallower
// schema eliminated the failures; run them concurrently so total latency doesn't just
// double because it's now two requests instead of one.
const feedbackModel = model.withStructuredOutput(feedbackSchema);
const tailorModel = model.withStructuredOutput(resumeContentSchema);

const MAX_ATTEMPTS = 3;

async function invokeWithRetry<T>(call: () => Promise<T>, label: string): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            return await call();
        } catch (err) {
            lastError = err;
            console.error(`${label} attempt ${attempt}/${MAX_ATTEMPTS} failed:`, err instanceof Error ? err.message : err);
        }
    }
    throw lastError;
}

export async function analyzeAndTailorResume({
    jobTitle,
    jobDescriptionText,
    profile,
}: {
    jobTitle: string;
    jobDescriptionText: string;
    profile: ResumeContent;
}) {
    const prompt = buildAnalyzeAndTailorPrompt({ jobTitle, jobDescriptionText, profile });
    const messages = [
        {
            role: 'system' as const,
            content:
                'You are a careful, honest resume/ATS analyst. You never invent experience, employers, dates, or skills that are not present in the information you are given.',
        },
        {
            role: 'user' as const,
            content: prompt,
        },
    ];

    const [feedback, tailoredResume] = await Promise.all([
        invokeWithRetry(() => feedbackModel.invoke(messages), 'feedback'),
        invokeWithRetry(() => tailorModel.invoke(messages), 'tailoredResume'),
    ]);

    return { feedback, tailoredResume };
}
