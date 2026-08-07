import { Link } from "react-router";
import { FileText } from "lucide-react";
import ScoreCircle from "~/components/ScoreCircle";

export const statusBadgeClasses: Record<ApplicationStatus, string> = {
    saved: "bg-gray-100 text-gray-600",
    applied: "bg-badge-yellow text-badge-yellow-text",
    interviewing: "bg-badge-yellow text-badge-yellow-text",
    offer: "bg-badge-green text-badge-green-text",
    rejected: "bg-badge-red text-badge-red-text",
    withdrawn: "bg-gray-100 text-gray-600",
};

export const statusLabel: Record<ApplicationStatus, string> = {
    saved: "Saved",
    applied: "Applied",
    interviewing: "Interviewing",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
};

const ResumeCard = ({
    application,
    overallScore,
}: {
    application: Application;
    overallScore?: number;
}) => {
    const { _id, companyName, jobTitle, status, notes, jobDescriptionText } = application;
    const caption = notes || `${jobDescriptionText.slice(0, 90)}${jobDescriptionText.length > 90 ? "…" : ""}`;

    return (
        <Link to={`/applications/${_id}`} className="resume-card animate-in fade-in duration-100">
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
                {overallScore !== undefined && (
                    <div className="shrink-0">
                        <ScoreCircle score={overallScore} size={52}></ScoreCircle>
                    </div>
                )}
            </div>
            <div className="gradient-border flex h-32 w-full items-center justify-center gap-2 animate-in fade-in duration-1000">
                <FileText className="h-5 w-5 text-[#606beb]" />
                <span className="text-sm font-medium text-dark-200">
                    {overallScore !== undefined ? "Tailored Resume PDF" : "Not analyzed yet"}
                </span>
            </div>
            <p className="line-clamp-2 text-xs text-dark-200">{caption}</p>
        </Link>
    );
};

export default ResumeCard;
