import { getClassesWithExams } from "@/lib/actions/report";
import { getSchoolSettings } from "@/lib/actions/school";
import ReportsPageClient from "@/components/reports/reports-page-client";

export default async function ReportsPage() {
    const classes = await getClassesWithExams();
    const schoolSettings = await getSchoolSettings();

    return <ReportsPageClient classes={classes} schoolSettings={schoolSettings} />;
}
