import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeContent } from '../../models/Profile.model';

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
    header: { marginBottom: 16, textAlign: 'center' },
    name: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
    contactRow: { fontSize: 9, color: '#444' },
    section: { marginBottom: 12 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        borderBottom: '1px solid #333',
        marginBottom: 6,
        paddingBottom: 2,
    },
    entry: { marginBottom: 8 },
    entryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    entryTitle: { fontSize: 10, fontWeight: 700 },
    entryTech: { fontWeight: 400, color: '#333' },
    entrySubtext: { fontSize: 9, fontStyle: 'italic', color: '#555', marginTop: 1, marginBottom: 2 },
    entryDates: { fontSize: 9, color: '#555' },
    bullet: { flexDirection: 'row', marginBottom: 2 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1 },
    skillCategoryLabel: { fontWeight: 700 },
});

function formatDateRange(start: string, end: string | undefined, current: boolean) {
    return `${start} – ${current ? 'Present' : (end ?? '')}`;
}

export function ClassicResumeTemplate({ profile }: { profile: ResumeContent }) {
    const { contactInfo, summary, workHistory, projects, skills, education, certifications } = profile;

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.name}>{contactInfo.fullName}</Text>
                    <Text style={styles.contactRow}>
                        {[contactInfo.location, contactInfo.phone, contactInfo.email, contactInfo.linkedin, contactInfo.website]
                            .filter(Boolean)
                            .join('  |  ')}
                    </Text>
                </View>

                {summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text>{summary}</Text>
                    </View>
                )}

                {workHistory.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {workHistory.map((job, i) => (
                            <View key={i} style={styles.entry}>
                                <View style={styles.entryHeaderRow}>
                                    <Text style={styles.entryTitle}>{job.title} — {job.company}</Text>
                                    <Text style={styles.entryDates}>
                                        {formatDateRange(job.startDate, job.endDate, job.current)}
                                    </Text>
                                </View>
                                {job.location && <Text style={styles.entrySubtext}>{job.location}</Text>}
                                {job.bullets.map((bullet, j) => (
                                    <View key={j} style={styles.bullet} wrap={false}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.bulletText}>{bullet}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((project, i) => (
                            <View key={i} style={styles.entry}>
                                <Text style={styles.entryTitle}>
                                    {project.name}
                                    {project.description && (
                                        <Text style={styles.entryTech}> ({project.description})</Text>
                                    )}
                                </Text>
                                {project.bullets.map((bullet, j) => (
                                    <View key={j} style={styles.bullet} wrap={false}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.bulletText}>{bullet}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map((ed, i) => (
                            <View key={i} style={styles.entry}>
                                <View style={styles.entryHeaderRow}>
                                    <Text style={styles.entryTitle}>
                                        {ed.degree}
                                        {ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ''}
                                    </Text>
                                    <Text style={styles.entryDates}>
                                        {[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}
                                    </Text>
                                </View>
                                <Text style={styles.entrySubtext}>
                                    {ed.institution}
                                    {ed.location ? ` — ${ed.location}` : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {certifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {certifications.map((cert, i) => (
                            <Text key={i}>
                                {cert.name}
                                {cert.issuer ? ` — ${cert.issuer}` : ''}
                                {cert.date ? ` (${cert.date})` : ''}
                            </Text>
                        ))}
                    </View>
                )}

                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        {skills.map((group, i) => (
                            <Text key={i} style={{ marginBottom: 2 }}>
                                <Text style={styles.skillCategoryLabel}>{group.category}: </Text>
                                {group.items.join(', ')}
                            </Text>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
}
