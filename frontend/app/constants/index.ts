function placeholderFeedback(overallScore: number): Feedback {
    return {
        overallScore,
        ATS: { score: 90, tips: [] },
        toneAndStyle: { score: 90, tips: [] },
        content: { score: 90, tips: [] },
        structure: { score: 90, tips: [] },
        skills: { score: 90, tips: [] },
    };
}

export const resumes: Resume[] = [
    // Live / Active Opportunities
    {
        id: "1",
        companyName: "Stripe",
        jobTitle: "Senior Frontend Engineer",
        imagePath: "/images/resume-1.png",
        resumePath: "/resumes/resume-1.pdf",
        status: "live",
        statusNote: "Interview scheduled for Aug 6.",
        feedback: placeholderFeedback(82),
    },
    {
        id: "2",
        companyName: "Airbnb",
        jobTitle: "Product Engineer",
        imagePath: "/images/resume-2.png",
        resumePath: "/resumes/resume-2.pdf",
        status: "live",
        statusNote: "Screening call with recruiter this week.",
        feedback: placeholderFeedback(78),
    },
    {
        id: "3",
        companyName: "Notion",
        jobTitle: "Frontend Engineer",
        imagePath: "/images/resume-3.png",
        resumePath: "/resumes/resume-3.pdf",
        status: "live",
        statusNote: "Recruiter is actively confirming role details.",
        feedback: placeholderFeedback(75),
    },

    // Rejected
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume-1.png",
        resumePath: "/resumes/resume-1.pdf",
        status: "rejected",
        statusNote: "Declined — likely high competition volume for this req.",
        feedback: placeholderFeedback(85),
    },
    {
        id: "5",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume-2.png",
        resumePath: "/resumes/resume-2.pdf",
        status: "rejected",
        statusNote: "Declined — resume didn't clearly surface required cloud certifications (materials issue).",
        feedback: placeholderFeedback(55),
    },
    {
        id: "6",
        companyName: "Meta",
        jobTitle: "Software Engineer",
        imagePath: "/images/resume-3.png",
        resumePath: "/resumes/resume-3.pdf",
        status: "rejected",
        statusNote: "Declined — role was filled internally before your application was reviewed (timing).",
        feedback: placeholderFeedback(70),
    },

    // Built & Sent — Awaiting Response (sorted roughly by score)
    {
        id: "7",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume-1.png",
        resumePath: "/resumes/resume-1.pdf",
        status: "sent",
        statusNote: "Strong match — minor gap in Swift Concurrency experience.",
        feedback: placeholderFeedback(88),
    },
    {
        id: "8",
        companyName: "Shopify",
        jobTitle: "Full Stack Developer",
        imagePath: "/images/resume-2.png",
        resumePath: "/resumes/resume-2.pdf",
        status: "sent",
        statusNote: "Solid fit — no direct production GraphQL experience listed.",
        feedback: placeholderFeedback(80),
    },
    {
        id: "9",
        companyName: "Amazon",
        jobTitle: "Backend Engineer",
        imagePath: "/images/resume-3.png",
        resumePath: "/resumes/resume-3.pdf",
        status: "sent",
        statusNote: "Good fundamentals — lacking large-scale distributed systems examples.",
        feedback: placeholderFeedback(74),
    },
    {
        id: "10",
        companyName: "Spotify",
        jobTitle: "Frontend Engineer",
        imagePath: "/images/resume-1.png",
        resumePath: "/resumes/resume-1.pdf",
        status: "sent",
        statusNote: "Decent fit — limited evidence of design system work.",
        feedback: placeholderFeedback(68),
    },

    // Skipped (Not Applied)
    {
        id: "11",
        companyName: "Netflix",
        jobTitle: "Senior Engineering Manager",
        imagePath: "/images/resume-2.png",
        resumePath: "/resumes/resume-2.pdf",
        status: "skipped",
        statusNote: "Skipped — requires 5+ years of direct people-management experience you don't have yet.",
        feedback: placeholderFeedback(60),
    },
    {
        id: "12",
        companyName: "Palantir",
        jobTitle: "Forward Deployed Engineer",
        imagePath: "/images/resume-3.png",
        resumePath: "/resumes/resume-3.pdf",
        status: "skipped",
        statusNote: "Skipped — role requires an active US security clearance (authorization blocker).",
        feedback: placeholderFeedback(65),
    },
    {
        id: "13",
        companyName: "Canva",
        jobTitle: "Frontend Engineer (Sydney)",
        imagePath: "/images/resume-1.png",
        resumePath: "/resumes/resume-1.pdf",
        status: "skipped",
        statusNote: "Skipped — on-site relocation to Australia required, not pursuing right now (location blocker).",
        feedback: placeholderFeedback(72),
    },
];

export const recurringPatterns: RecurringPattern[] = [
    {
        id: "1",
        title: "Named cloud certifications (AWS/Azure)",
        frequency: 3,
        companies: ["Microsoft", "Amazon", "Shopify"],
        note: "Your single highest-leverage gap — three recent roles specifically called out a named cloud certification that isn't reflected on your profile. Worth prioritizing if you're targeting backend/cloud-heavy roles.",
    },
    {
        id: "2",
        title: "Production-scale distributed systems experience",
        frequency: 2,
        companies: ["Amazon", "Meta"],
        note: "Larger companies keep looking for concrete examples of systems at scale. If you have any relevant project work, make sure it's called out explicitly with real numbers (throughput, data volume, uptime).",
    },
    {
        id: "3",
        title: "Modern design system / component library work",
        frequency: 2,
        companies: ["Spotify", "Shopify"],
        note: "Frontend-heavy roles are looking for direct experience building or maintaining a shared component library, not just consuming one. Worth adding a project bullet if you have any such experience.",
    },
    {
        id: "4",
        title: "5+ years of direct people-management experience",
        frequency: 1,
        companies: ["Netflix"],
        note: "This is a hard requirement for senior/lead titles, not a skills gap you can close quickly. If you're targeting IC roles, filtering these out earlier could save review time.",
    },
    {
        id: "5",
        title: "Active security clearance / work authorization",
        frequency: 1,
        companies: ["Palantir"],
        note: "A hard eligibility blocker, not a resume issue — nothing to improve here. Best handled by filtering these roles out before applying.",
    },
];

export const recommendedTechnologies: RecommendedTechnology[] = [
    {
        id: "1",
        name: "AWS Certified Solutions Architect – Associate",
        reason: "Directly closes your most frequent gap. This is the credential named explicitly by roles at Microsoft and Amazon, and it's recognized broadly enough to cover most cloud-adjacent postings, not just AWS-specific ones.",
        relatedGapId: "1",
    },
    {
        id: "2",
        name: "System design fundamentals (queues, sharding, caching)",
        reason: "Amazon and Meta both wanted concrete distributed-systems examples. You don't need production scale yourself — a well-reasoned case study of how you'd design for it demonstrates the thinking reviewers are screening for.",
        relatedGapId: "2",
    },
    {
        id: "3",
        name: "Storybook + component-driven design systems",
        reason: "Spotify and Shopify both screened for direct design-system ownership. Storybook is the de facto standard for this and gives you something concrete to point to beyond 'used a component library.'",
        relatedGapId: "3",
    },
];

export const learningRoadmap: LearningRoadmapStep[] = [
    {
        id: "1",
        order: 1,
        title: "Close the cloud certification gap",
        description: "Start here — it's your highest-frequency gap (3 of 13 applications) and the most self-contained to fix. Study for and sit the AWS Solutions Architect – Associate exam before applying to any more backend/cloud-heavy roles.",
        relatedGapId: "1",
    },
    {
        id: "2",
        order: 2,
        title: "Build a distributed-systems case study",
        description: "Once the certification is in progress, pick one project (existing or new) and rewrite its story around scale: what would break at 10x traffic, how you'd shard or cache around it, what you'd measure. This turns an abstract gap into a concrete resume bullet.",
        relatedGapId: "2",
    },
    {
        id: "3",
        order: 3,
        title: "Stand up a small component library in Storybook",
        description: "Lowest frequency of the three closable gaps, so it's fine to tackle last. Even a small personal-project component library documented in Storybook gives you a real answer the next time a frontend role asks about design-system ownership.",
        relatedGapId: "3",
    },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                        AIResponseFormat,
                                    }: {
    jobTitle: string;
    jobDescription: string;
    AIResponseFormat: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;
