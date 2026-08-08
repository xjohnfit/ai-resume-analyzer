import { Request, Response } from 'express';
import { ChatAnthropic } from '@langchain/anthropic';
import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';
import { pipeUIMessageStreamToResponse, isTextUIPart } from 'ai';
import { env } from '../config/env';
import { Profile } from '../models/Profile.model';
import { Application } from '../models/Application.model';
import { FeedbackReport } from '../models/FeedbackReport.model';
import { ChatMessage } from '../models/ChatMessage.model';
import { User } from '../models/User.model';
import { incrementChatMessageUsage } from '../services/usage.service';
import { buildChatSystemPrompt, type ApplicationSummaryForChat } from '../ai/prompts/chatAssistant.prompt';

const { ANTHROPIC_API_KEY } = env;

const model = new ChatAnthropic({
    apiKey: ANTHROPIC_API_KEY,
    model: 'claude-sonnet-5',
});

// How many recent messages get resent to Claude as conversation context on each
// turn. The full conversation still lives in chat_messages/the frontend's scrollback —
// this only caps what gets billed on every single message, since an LLM call's cost
// grows with the whole history, not just the new message.
const MAX_HISTORY_MESSAGES = 20;

export async function chat(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { messages } = req.body;

    const profile = await Profile.findOne({ userId });
    const applications = await Application.find({ userId }).sort({ createdAt: -1 });

    const applicationSummaries: ApplicationSummaryForChat[] = await Promise.all(
        applications.map(async (application): Promise<ApplicationSummaryForChat> => {
            if (!application.currentFeedbackReportId) {
                return { companyName: application.companyName, jobTitle: application.jobTitle, status: application.status };
            }
            const feedback = await FeedbackReport.findById(application.currentFeedbackReportId);
            if (!feedback) {
                return { companyName: application.companyName, jobTitle: application.jobTitle, status: application.status };
            }
            const improveTips = [
                ...feedback.ATS.tips,
                ...feedback.toneAndStyle.tips,
                ...feedback.content.tips,
                ...feedback.structure.tips,
                ...feedback.skills.tips,
            ]
                .filter((tip) => tip.type === 'improve')
                .map((tip) => tip.tip);
            return {
                companyName: application.companyName,
                jobTitle: application.jobTitle,
                status: application.status,
                overallScore: feedback.overallScore,
                improveTips,
            };
        }),
    );

    const systemPrompt = buildChatSystemPrompt({ profile, applications: applicationSummaries });

    // Persist the user's new message — the last item in the array is always the latest one.
    const lastMessage = messages[messages.length - 1];
    const userText = (lastMessage?.parts ?? [])
        .filter(isTextUIPart)
        .map((part: { text: string }) => part.text)
        .join('');
    if (userText) {
        await ChatMessage.create({ userId, role: 'user', content: userText });
    }

    const user = await User.findById(userId);
    if (user) {
        await incrementChatMessageUsage(user);
    }

    const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
    const langchainMessages = await toBaseMessages(recentMessages);
    const stream = await model.stream([{ role: 'system', content: systemPrompt }, ...langchainMessages]);

    await pipeUIMessageStreamToResponse({
        response: res,
        stream: toUIMessageStream(stream, {
            onFinal: async (completion) => {
                await ChatMessage.create({ userId, role: 'assistant', content: completion });
            },
        }),
    });
}

export async function getChatHistory(req: Request, res: Response) {
    const messages = await ChatMessage.find({ userId: req.user!.userId }).sort({ createdAt: 1 });
    res.json(messages);
}
