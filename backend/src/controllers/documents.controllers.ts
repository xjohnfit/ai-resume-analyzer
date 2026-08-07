import { Request, Response } from 'express';
import { Document } from '../models/Document.model';
import { renderResumePdf } from '../pdf/renderResumePdf';

export async function downloadDocument(req: Request, res: Response) {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!document) {
        return res.status(404).json({ error: 'Document not found.' });
    }

    try {
        const pdfBuffer = await renderResumePdf(document.contentSnapshot);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="tailored-resume.pdf"');
        res.send(pdfBuffer);
    } catch (err) {
        console.error('document download failed:', err);
        res.status(500).json({ error: 'Failed to generate PDF. Please try again.' });
    }
}
