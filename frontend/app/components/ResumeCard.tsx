import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

const statusBadgeClasses: Record<ApplicationStatus, string> = {
    live: "bg-badge-green text-badge-green-text",
    sent: "bg-badge-yellow text-badge-yellow-text",
    rejected: "bg-badge-red text-badge-red-text",
    skipped: "bg-gray-100 text-gray-600",
};

const statusLabel: Record<ApplicationStatus, string> = {
    live: "Active",
    sent: "Awaiting response",
    rejected: "Rejected",
    skipped: "Skipped",
};

const ResumeCard = ({resume: {id, companyName, jobTitle, feedback, imagePath, status, statusNote}}: { resume: Resume }) => {
    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-100">
            <div className="resume-card-header">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeClasses[status]}`}>
                        {statusLabel[status]}
                    </span>
                    <h2 className="text-black! truncate text-base font-semibold">
                        {companyName}
                    </h2>
                    <h3 className="truncate text-sm text-gray-500">
                        {jobTitle}
                    </h3>
                </div>
                <div className="shrink-0">
                    <ScoreCircle score={feedback.overallScore} size={52}></ScoreCircle>
                </div>
            </div>
            <div className="gradient-border animate-in fade-in duration-1000 p-1">
                <img src={imagePath} alt="Resume" className="h-32 w-full rounded-lg object-cover object-top"/>
            </div>
            <p className="line-clamp-2 text-xs text-dark-200">{statusNote}</p>
        </Link>
    );
};

export default ResumeCard;