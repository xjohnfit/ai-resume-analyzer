import { Request, Response } from 'express';
import { z } from 'zod';
import { ContactMessage } from '../models/ContactMessage.model';
import { sendContactNotificationEmail } from '../services/email.service';

const contactMessageSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    category: z.enum(['subscription', 'bug', 'question', 'other']),
    message: z.string().min(1),
});

export async function submitContactMessage(req: Request, res: Response) {
    const parsed = contactMessageSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const { name, email, category, message } = parsed.data;

    await ContactMessage.create({ name, email, category, message });

    try {
        await sendContactNotificationEmail({ name, email, category, message });
    } catch (err) {
        console.error('Failed to send contact notification email:', err);
    }

    res.status(201).json({ success: true });
}
