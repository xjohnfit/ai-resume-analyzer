import { renderToBuffer } from '@react-pdf/renderer';
import type { ResumeContent } from '../models/Profile.model';
import { ClassicResumeTemplate } from './templates/ClassicResumeTemplate';

export async function renderResumePdf(profile: ResumeContent): Promise<Buffer> {
    return renderToBuffer(<ClassicResumeTemplate profile={profile} />);
}
