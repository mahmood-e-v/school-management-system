import { getAnalyticsData } from "@/lib/actions/analytics";
import { AnalyticsDashboard } from "@/components/analytics/dashboard-charts";

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    if (data.error) {
        return <div>Error loading analytics</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">School Analytics</h1>
            <AnalyticsDashboard
                attendanceStats={data.attendanceStats}
                examPerformance={data.examPerformance}
            />
        </div>
    );
}
