import { getClassesWithExams } from "@/lib/actions/report";
import { getSchoolSettings, getActiveAcademicYear } from "@/lib/actions/school";
import ReportsPageClient from "@/components/reports/reports-page-client";

export default async function ReportsPage() {
    const schoolSettings = await getSchoolSettings();
    const activeYear = await getActiveAcademicYear();
    const classes = await getClassesWithExams(activeYear);

    return <ReportsPageClient classes={classes} schoolSettings={schoolSettings} activeYear={activeYear} />;
}
