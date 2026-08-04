import { ChatAnthropic } from '@langchain/anthropic';
import { env } from '../../config/env';
import { profileParseSchema } from '../schemas/profileParse.schema';

const { ANTHROPIC_API_KEY } = env;

const model = new ChatAnthropic({
    apiKey: ANTHROPIC_API_KEY,
    model: 'claude-sonnet-5',
});

const structuredModel = model.withStructuredOutput(profileParseSchema);

export async function parseResumeText(rawText: string) {
    return structuredModel.invoke([
        {
            role: 'system',
            content:
                'You extract structured profile data from raw resume text. Only include information that is actually present in the text. Never invent employers, dates, skills, or any other detail that is not clearly stated.',
        },
        {
            role: 'user',
            content: rawText,
        },
    ]);
}
