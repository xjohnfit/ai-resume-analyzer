import type { ResumeContent } from '../../models/Profile.model';

function formatProfileSummary(profile: ResumeContent | null): string {
    if (!profile) return 'No profile created yet.';

    const lines: string[] = [];
    if (profile.contactInfo.fullName) lines.push(`Name: ${profile.contactInfo.fullName}`);
    if (profile.summary) lines.push(`Summary: ${profile.summary}`);

    if (profile.workHistory.length > 0) {
        lines.push(
            'Work history:',
            ...profile.workHistory.map((job) => {
                const dates = `${job.startDate} - ${job.current ? 'Present' : (job.endDate ?? '')}`;
                return `- ${job.title} at ${job.company} (${dates}): ${job.bullets.join(' ')}`;
            }),
        );
    }

    if (profile.skills.length > 0) {
        lines.push('Skills: ' + profile.skills.map((g) => `${g.category}: ${g.items.join(', ')}`).join(' | '));
    }

    if (profile.education.length > 0) {
        lines.push('Education: ' + profile.education.map((ed) => `${ed.degree} - ${ed.institution}`).join('; '));
    }

    return lines.join('\n');
}

export interface ApplicationSummaryForChat {
    companyName: string;
    jobTitle: string;
    status: string;
    overallScore?: number;
    improveTips?: string[];
}

function formatApplicationsSummary(applications: ApplicationSummaryForChat[]): string {
    if (applications.length === 0) return 'No applications tracked yet.';

    return applications
        .map((app) => {
            const base = `- ${app.companyName} (${app.jobTitle}), status: ${app.status}`;
            if (app.overallScore === undefined) return `${base}, not yet analyzed.`;
            const tipsText = app.improveTips && app.improveTips.length > 0
                ? ` Improvement areas: ${app.improveTips.join('; ')}.`
                : '';
            return `${base}, fit score: ${app.overallScore}/100.${tipsText}`;
        })
        .join('\n');
}

export function buildChatSystemPrompt({
    profile,
    applications,
}: {
    profile: ResumeContent | null;
    applications: ApplicationSummaryForChat[];
}): string {
    return `You are a read-only assistant inside Applyze, a job-application tracking app. You help the user understand their own profile, applications, and AI feedback history, and you can help them prepare for interviews.

STRICT RULES:
- You are read-only. You cannot edit the profile, create/update/delete an application, or take any action on the user's behalf. If asked to do something like that, explain that you can't and point them to the relevant page in the app instead.
- Only answer using the real data provided below. Never invent facts about the user's experience, applications, or feedback.
- For interview-prep questions, ground your suggestions in the user's real experience below — don't invent qualifications they don't have.

USER'S PROFILE:
${formatProfileSummary(profile)}

USER'S APPLICATIONS:
${formatApplicationsSummary(applications)}`;
}
