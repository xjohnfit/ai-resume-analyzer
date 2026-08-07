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

