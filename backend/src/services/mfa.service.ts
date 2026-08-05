import twilio from 'twilio';
import { env } from '../config/env';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function sendVerificationCode(phoneNumber: string) {
    await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phoneNumber, channel: 'sms' });
}

export async function checkVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
        const result = await client.verify.v2
            .services(TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({ to: phoneNumber, code });

        return result.status === 'approved';
    } catch (err) {
        if (err instanceof Error && 'status' in err && err.status === 404) {
            return false;
        }
        throw err;
    }
}

