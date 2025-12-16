import { getClassesWithExams } from "@/lib/actions/report";
import ReportsPageClient from "@/components/reports/reports-page-client";

export default async function ReportsPage() {
    const classes = await getClassesWithExams();

    return <ReportsPageClient classes={classes} />;
}
