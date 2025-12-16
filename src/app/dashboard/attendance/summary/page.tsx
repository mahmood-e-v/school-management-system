import { getClasses } from "@/lib/actions/class";
import { SummaryView } from "@/components/attendance/summary-view";

export default async function AttendanceSummaryPage() {
    const classes = await getClasses();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Attendance Summary</h1>
            <SummaryView classes={classes} />
        </div>
    );
}
