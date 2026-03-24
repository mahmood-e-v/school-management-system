import { getClassesWithExams } from "@/lib/actions/report";
import { getSchoolSettings } from "@/lib/actions/school";
import ReportsPageClient from "@/components/reports/reports-page-client";

export default async function ReportsPage() {
    const schoolSettings = await getSchoolSettings();
    const classes = await getClassesWithExams(schoolSettings?.currentAcademicYear);

    return <ReportsPageClient classes={classes} schoolSettings={schoolSettings} />;
}
