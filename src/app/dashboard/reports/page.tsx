import { getExams } from "@/lib/actions/exam";
import { getClasses } from "@/lib/actions/class";
import { ReportSelector } from "@/components/reports/report-selector";

export default async function ReportsPage() {
    const exams = await getExams();
    const classes = await getClasses();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Report Cards</h1>
            <ReportSelector exams={exams} classes={classes} />
        </div>
    );
}
