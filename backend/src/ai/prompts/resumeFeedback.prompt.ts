import type { ResumeContent } from '../../models/Profile.model';

function formatProfileAsText(profile: ResumeContent): string {
    const lines: string[] = [];

    if (profile.summary) {
        lines.push(`SUMMARY\n${profile.summary}`);
    }

    if (profile.workHistory.length > 0) {
        lines.push(
            'WORK HISTORY',
            // Deliberately excludes job.location — the AI's output schema has no location
            // field (it's reattached from the real profile afterward, untouched by the AI),
            // and showing it here with nowhere clean to put it back out just teaches the model
            // to fold it into the company name instead (e.g. "Freelancer, Remote").
            ...profile.workHistory.map((job) => {
                const dates = `${job.startDate} - ${job.current ? 'Present' : (job.endDate ?? '')}`;
                const bullets = job.bullets.map((b) => `  - ${b}`).join('\n');
                return `${job.title} at ${job.company} (${dates})\n${bullets}`;
            }),
        );
    }

    if (profile.projects.length > 0) {
        lines.push(
            'PROJECTS',
            ...profile.projects.map((p) => {
                const bullets = p.bullets.map((b) => `  - ${b}`).join('\n');
                return `${p.name}${p.description ? `: ${p.description}` : ''}\n${bullets}`;
            }),
        );
    }

    if (profile.skills.length > 0) {
        lines.push(
            'SKILLS',
            ...profile.skills.map((group) => `${group.category}: ${group.items.join(', ')}`),
        );
    }

    if (profile.education.length > 0) {
        lines.push(
            'EDUCATION',
            ...profile.education.map((ed) => {
                const location = ed.location ? `, ${ed.location}` : '';
                return `${ed.degree}${ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ''} - ${ed.institution}${location}`;
            }),
        );
    }

    if (profile.certifications.length > 0) {
        lines.push(
            'CERTIFICATIONS',
            ...profile.certifications.map((c) => `${c.name}${c.issuer ? ` - ${c.issuer}` : ''}`),
        );
    }

    return lines.join('\n\n');
}

export function buildAnalyzeAndTailorPrompt({
    jobTitle,
    jobDescriptionText,
    profile,
}: {
    jobTitle: string;
    jobDescriptionText: string;
    profile: ResumeContent;
}): string {
    return `You are an expert in ATS (Applicant Tracking System) analysis and resume tailoring.

Analyze how well this candidate's real experience matches the job below, and produce a JD-tailored version of their resume content.

RULES — READ CAREFULLY:
- Only use facts, employers, dates, skills, and achievements that appear in the candidate's profile below. Never invent or exaggerate anything not already present.
- Be thorough and honest in the scoring — if the resume is a poor match for this job, say so and score it low. This is meant to help the candidate improve, not to flatter them.
- The tailored resume must be substantively rewritten, not lightly edited. Copying a bullet or the summary from the candidate profile with only a word or two changed is a failure — every sentence in the tailored output should read as freshly written for this specific job, while staying 100% factually identical to the source (same employers, dates, technologies, numbers, and outcomes). Rewrite sentence structure, reorder which part of each achievement leads, and substitute in the job description's own terminology wherever it honestly describes the same real work. Reordering bullets or swapping one synonym is not tailoring — genuinely rewriting how each achievement is expressed is.
- Example of what NOT to do: source bullet "Built CI/CD pipelines in Jenkins and GitHub Actions to automate linting, Jest tests, builds, and deployments" → an under-tailored bullet just reorders or trims that same sentence. A properly tailored bullet restructures it entirely, e.g. leading with the JD's own framing (say the JD emphasizes "release engineering") and rephrasing throughout — while never changing what actually happened.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescriptionText}

CANDIDATE PROFILE:
${formatProfileAsText(profile)}`;
}
